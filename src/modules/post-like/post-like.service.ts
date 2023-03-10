import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessage } from 'enum/error';
import { PostLike } from 'src/core/database/mysql/entity/postLike.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PostLikeService {
  constructor(
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
  ) {}

  async checkAccess(
    user_id: string,
    post_id: number,
    entityManager?: EntityManager,
  ) {
    const postLikeRepository = entityManager
      ? entityManager.getRepository<PostLike>('post_like')
      : this.postLikeRepository;
    const postLike = await postLikeRepository.findOne({
      user_id,
      post_id,
    });

    if (postLike) {
      return true;
    } else {
      return false;
    }
  }

  async addLikePost(
    post_id: number,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const isExist = await this.checkAccess(user_id, post_id);

    if (isExist) {
      throw new HttpException(
        ErrorMessage.POST_LIKE_EXIST,
        HttpStatus.CONFLICT,
      );
    }

    const postLikeRepository = entityManager
      ? entityManager.getRepository<PostLike>('post_like')
      : this.postLikeRepository;
    return await postLikeRepository.save({ post_id, user_id });
  }

  async deleteLikePost(
    userData: IUserData,
    post_id: number,
    entityManager?: EntityManager,
  ) {
    const postLikeRepository = entityManager
      ? entityManager.getRepository<PostLike>('post_like')
      : this.postLikeRepository;

    const count = await postLikeRepository.count({
      post_id: post_id,
      user_id: userData.user_id,
    });

    if (count && count > 0) {
      await postLikeRepository.delete({
        post_id: post_id,
        user_id: userData.user_id,
      });
      return null;
    }
    throw new HttpException(
      ErrorMessage.LIKE_DOES_NOT_EXIST,
      HttpStatus.BAD_REQUEST,
    );
  }

  async getPostLikeByPostId(post_id: number, entityManager?: EntityManager) {
    const postLikeRepository = entityManager
      ? entityManager.getRepository<PostLike>('post_like')
      : this.postLikeRepository;

    return await postLikeRepository.find({ post_id });
  }
}
