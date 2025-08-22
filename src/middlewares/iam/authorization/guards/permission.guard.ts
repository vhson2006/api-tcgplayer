import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators/permission.decoration';
import { REQUEST_USER_KEY } from 'src/assets/configs/app.constant';
import { actions, modules } from 'src/assets/configs/app.permission';
import { CUSTOMER_TYPE } from 'src/assets/configs/app.common';
import { targetHaveValueInSource } from 'src/assets/utils/array';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY, 
      [
        context.getHandler(), 
        context.getClass()
      ]
    );
    if (!contextPermissions) {
      return true;
    }
    const user = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];
    return contextPermissions.every((permission) => {// 👈 use of .every() diff than roles guard
      const customerPermissions = [
        CUSTOMER_TYPE.NEW, 
        CUSTOMER_TYPE.ACTIVED, 
        CUSTOMER_TYPE.INACTIVED, 
        CUSTOMER_TYPE.BLOCK, 
        CUSTOMER_TYPE.VIP
      ];
      if (targetHaveValueInSource(customerPermissions, user?.permissions)) {
        return user.permissions?.includes(permission)
      }
      
      const decryptPermission = (pre: any, cur: any) => {
        const arr = cur.split('.');
        return [
          ...pre, 
          `${actions.find((a: any) => a.charAt(0) === arr[0])}.${modules[arr[1]]}`
        ]
      };
      return user.permissions?.reduce(decryptPermission, []).includes(permission)
    },);
  }
}