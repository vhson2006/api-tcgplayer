import { BadRequestException, Inject, Injectable, LoggerService, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import jwtConfig from '../config/jwt.config';
import { HashingService } from '../hashing/hashing.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CUSTOMER_TYPE, EMAIL_TYPE, VALIDATION_TOKEN_TYPE } from 'src/assets/configs/app.common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CORRECT, INCORRECT, QUEUE } from 'src/assets/configs/app.constant';
import { SignUpDto } from './dto/sign-up.dto';
import { CustomerType } from 'src/modules/customer/entities/customer-type.entity';
import { generateNumber, generateUniqueCode } from 'src/assets/utils/code';
import { ValidateToken } from '../entities/validate-token.entity';
import { ValidateTokenType } from '../entities/validate-token-type.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class CustomerAuthenticationService {
  constructor(
    @InjectQueue(QUEUE.SEND_EMAIL) private readonly mailerQueue: Queue,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerType) private readonly customerTypeRepository: Repository<CustomerType>,
    @InjectRepository(ValidateToken) private readonly validateTokenRepository: Repository<ValidateToken>,
    @InjectRepository(ValidateTokenType) private readonly validateTokenTypeRepository: Repository<ValidateTokenType>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly i18nService: I18nService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  private async generateTokens(customer: Customer) {
    try {
      const refreshTokenId = randomUUID();
      const [accessToken, refreshToken] = await Promise.all([
        this.signToken(
          customer.id,
          this.jwtConfiguration.accessTokenTtl,
          { 
            permissions: [customer.type.type],
          },
        ),
        this.signToken(
          customer.id, 
          this.jwtConfiguration.refreshTokenTtl,
          {
            refreshTokenId,
          }
        ),
      ]);

      await this.refreshTokenIdsStorage.insert(customer.id, refreshTokenId);
      return {
        accessToken,
        refreshToken,
        permission: JSON.stringify({ customer: customer.type.type})
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`)
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
  
  private async signToken<T>(customerId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: customerId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async signIn(signInDto: SignInDto) {
    const { id: typeId } = await this.customerTypeRepository.findOneBy({ 
      type: CUSTOMER_TYPE.ACTIVED,
      group: CUSTOMER_TYPE.GROUP
    });

    const customer = await this.customerRepository.findOneBy({
      email: signInDto.email,
      typeId
    });

    if (!customer) {
      throw new BadRequestException(this.i18nService.translate('ERRORS.USER_NOT_FOUND'));
    }
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      customer.password,
    );
    if (!isEqual) {
      throw new BadRequestException(this.i18nService.translate('ERRORS.PASSWORD_INCORRECT'))
    }

    return await this.generateTokens(customer);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken, 
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        }
      );
      const customer = await this.customerRepository.findOneOrFail({
        relations: { type: true },
        where: {
          type: { type: CUSTOMER_TYPE.ACTIVED },
          id: sub,
        }
      });
      const isValid = await this.refreshTokenIdsStorage.validate(
        customer.id,
        refreshTokenId,
      );
      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(customer.id);
      } else {
        throw new Error(this.i18nService.translate('ERRORS.REFRESH_TOKEN_IS_INVALID'));
      }
      return this.generateTokens(customer);
    } catch (err) {
      this.logger.error(`${JSON.stringify(err)}`)
      if (err instanceof InvalidatedRefreshTokenError) {
        // Take action: notify user that his refresh token might have been stolen?
        throw new UnauthorizedException(this.i18nService.translate('ERRORS.ACCESS_DENY'));
      }
      throw new UnauthorizedException();
    }
  }

  @Transactional()
  async signUp(signInDto: SignUpDto) {
    try {
      const { email, password, ...params } = signInDto;
      const uniqueCheck = await this.customerRepository.findOne({
        where: { email }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }

      const { id: typeId } = await this.customerTypeRepository.findOneBy({ 
        type: CUSTOMER_TYPE.NEW,
        group: CUSTOMER_TYPE.GROUP
      });
      
      const { identifiers } = await this.customerRepository.insert({
        ...params,
        email,
        password: await this.hashingService.hash(password),
        typeId,
      });

      if (Array.isArray(identifiers) && identifiers.length > 0) {
        const { id: validateTokenTypeId } = await this.validateTokenTypeRepository.findOneBy({ 
          type: VALIDATION_TOKEN_TYPE.SECRET_URL,
          group: VALIDATION_TOKEN_TYPE.GROUP
        });
        const code = generateUniqueCode();
        await this.validateTokenRepository.insert({
          identify: email,
          pin: code,
          typeId: validateTokenTypeId
        });
        this.mailerQueue.add(EMAIL_TYPE.ACTIVATION, {code, email});
        return CORRECT;
      }

      return { status: INCORRECT };
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`)
      return { status: INCORRECT }
    }
  }

  @Transactional()
  async activate(email: string, token: string) {
    try {
      const { id: typeId } = await this.validateTokenTypeRepository.findOneBy({ 
        type: VALIDATION_TOKEN_TYPE.SECRET_URL,
        group: VALIDATION_TOKEN_TYPE.GROUP
      });

      const criteria = {
        identify: email,
        pin: token,
        typeId
      }
      const validate = await this.validateTokenRepository.findOneBy(criteria);
      if (validate) {
        const { id: customerTypeId } = await this.customerTypeRepository.findOneBy({ 
          type: CUSTOMER_TYPE.ACTIVED,
          group: CUSTOMER_TYPE.GROUP
        });
        await this.validateTokenRepository.softDelete(criteria);
        await this.customerRepository.update({ email }, { typeId: customerTypeId });

        return CORRECT
      }

      return { status: INCORRECT }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`)
      return { status: INCORRECT }
    }
  }

  @Transactional()
  async sendOtp(email: string) {
    try {
      const uniqueCheck = await this.customerRepository.findOne({
        where: { email }
      })
      if (uniqueCheck) {
        const { id: validateTokenTypeId } = await this.validateTokenTypeRepository.findOneBy({ 
          type: VALIDATION_TOKEN_TYPE.PIN_OTP,
          group: VALIDATION_TOKEN_TYPE.GROUP
        });

        const code = generateNumber();
        const { identifiers } = await this.validateTokenRepository.insert({
          identify: email,
          pin: code,
          typeId: validateTokenTypeId
        });
        if (Array.isArray(identifiers) && identifiers.length > 0) {
          this.mailerQueue.add(EMAIL_TYPE.OTP, {code, email});
        }
      }

      return { status: CORRECT }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`)
      return { status: INCORRECT }
    }
  }

  @Transactional()
  async resetPassword(pin: string, email: string, password: string) {
    try {
      const { id: validateTokenTypeId } = await this.validateTokenTypeRepository.findOneBy({ 
        type: VALIDATION_TOKEN_TYPE.PIN_OTP,
        group: VALIDATION_TOKEN_TYPE.GROUP
      });

      const criteria = {
        identify: email,
        pin,
        typeId: validateTokenTypeId
      }
      const validate = await this.validateTokenRepository.findOneBy(criteria);
      if (validate) {
        await this.validateTokenRepository.softDelete(criteria);
        const response = await this.customerRepository.update({ email }, { password: await this.hashingService.hash(password) });
        if (response.affected > 0) {
          return CORRECT;
        }
      }

      const guardCheck = await this.validateTokenRepository.findOneBy({ identify: email, typeId: validateTokenTypeId });
      if (guardCheck) {
        await this.validateTokenRepository.softDelete({ identify: email, typeId: validateTokenTypeId });
      }

      return { status: INCORRECT }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`)
      return { status: INCORRECT }
    }
  }
}