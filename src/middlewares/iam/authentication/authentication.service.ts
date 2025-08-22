import { BadRequestException, ConflictException, Inject, Injectable, LoggerService, UnauthorizedException } from '@nestjs/common';
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
import { modules } from 'src/assets/configs/app.permission';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EMPLOYEE_STATUS } from 'src/assets/configs/app.common';
import { Employee } from 'src/modules/employee/entities/employee.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    private readonly i18nService: I18nService,

  ) {}

  async signUp(signUpDto: any) {
    try {
      const employee = new Employee();
      
      employee.email = signUpDto.email;
      employee.password = await this.hashingService.hash(signUpDto.password);
      employee.name = signUpDto.name
      // employee.status = 'signUpDto.status'

      await this.employeeRepository.save(employee);
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code === pgUniqueViolationErrorCode) {
        throw new ConflictException();
      }
      throw err;
    }
  }

  async signIn(signInDto: SignInDto) {
    const employee = await this.employeeRepository.findOne({
      relations: { status: true },
      where: {
        status: { type: EMPLOYEE_STATUS.ACTIVED },
        email: signInDto.email,
      }
    });

    if (!employee) {
      throw new BadRequestException(this.i18nService.translate('ERRORS.USER_NOT_FOUND'));
    }
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      employee.password,
    );
    if (!isEqual) {
      throw new BadRequestException(this.i18nService.translate('ERRORS.PASSWORD_INCORRECT'))
    }

    return await this.generateTokens(employee);
  }

  async generateTokens(employee: Employee) {
    try {
      const encryptPermission = (pre: any, cur: any) => [
        ...pre, 
        `${cur.group.charAt(0)}.${modules.findIndex((m: string) => m === cur.type)}`
      ];
      const transformPermission = (pre: any, cur: any) => {
        if (!pre.hasOwnProperty(cur.type)) {
          pre[cur.type] = []
        }
        pre[cur.type].push(cur.group)
        return pre
      }
      const refreshTokenId = randomUUID();
      const [accessToken, refreshToken] = await Promise.all([
        this.signToken(
          employee.id,
          this.jwtConfiguration.accessTokenTtl,
          { 
            permissions: employee.role.permissions.reduce(encryptPermission, []),
          },
        ),
        this.signToken(
          employee.id, 
          this.jwtConfiguration.refreshTokenTtl,
          {
            refreshTokenId,
          }
        ),
      ]);

      await this.refreshTokenIdsStorage.insert(employee.id, refreshTokenId);
      return {
        accessToken,
        refreshToken,
        permission: JSON.stringify(employee.role.permissions.reduce(transformPermission, {}))
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`)
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
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
      const employee = await this.employeeRepository.findOneOrFail({
        relations: { status: true },
        where: {
          status: { type: EMPLOYEE_STATUS.ACTIVED },
          id: sub,
        }
      });
      const isValid = await this.refreshTokenIdsStorage.validate(
        employee.id,
        refreshTokenId,
      );
      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(employee.id);
      } else {
        throw new Error(this.i18nService.translate('ERRORS.REFRESH_TOKEN_IS_INVALID'));
      }
      return this.generateTokens(employee);
    } catch (err) {
      this.logger.error(`${JSON.stringify(err)}`)
      if (err instanceof InvalidatedRefreshTokenError) {
        // Take action: notify user that his refresh token might have been stolen?
        throw new UnauthorizedException(this.i18nService.translate('ERRORS.ACCESS_DENY'));
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(employeeId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: employeeId,
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
}