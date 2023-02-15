/* eslint-disable @typescript-eslint/no-var-requires */
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VLogin } from 'global/user/dto/login.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { handleBCRYPTCompare, handleBCRYPTHash } from 'src/helper/utils';

import { UserService } from 'src/modules/user/user.service';
import { IResponseAuth } from './interface';

// import admin from 'src/main';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    public jwtService: JwtService,
  ) {}

  async getUserById(user_id: string) {
    return await this.userService.getUserByUserId(user_id);
  }

  async returnResponseAuth(userExist): Promise<IResponseAuth> {
    const payloadToken = {
      user_id: userExist.user_id,
    };

    const token = this.jwtService.sign(payloadToken, {
      secret: 'cmac56116c11a8s189a1s9c891a13cs',
      expiresIn: 100000,
    });

    this.userService.updateUser(userExist.user_id, {
      token,
    });

    return {
      token,
    };
  }

  async signup(body: VSignUp) {
    const email = await this.userService.getUserByEmail(body.email_address);

    const userName = await this.userService.getUserByUserName(body.username);

    if (email) {
      throw new HttpException(
        ErrorMessage.GMAIL_ALREADY_EXITS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userName) {
      throw new HttpException(
        ErrorMessage.USER_NAME_ALREADY_EXITS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userParams = new User();
    userParams.email = body.email_address;
    userParams.phone_number = body.phone_number;
    userParams.user_name = body.username;
    userParams.password = await handleBCRYPTHash(body.password);
    userParams.is_deleted = EIsDelete.NOT_DELETE;
    const user = await this.userService.createUser(userParams);

    const data = await this.returnResponseAuth(user);

    return {
      token: data.token,
      user_data: {
        user_id: user.user_id,
      },
    };
  }

  async login(body: VLogin) {
    const user = await this.userService.getUserByUserName(body.username);

    if (!user)
      throw new HttpException(
        ErrorMessage.USER_NAME_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const password = await handleBCRYPTCompare(body.password, user.password);

    if (!password)
      throw new HttpException(
        ErrorMessage.PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );
    // const payloadToken = {
    //   user_id: user.user_id,
    // };

    const data = await this.returnResponseAuth(user);
    return {
      user_id: user.user_id,
      token: data.token,
    };
  }
}