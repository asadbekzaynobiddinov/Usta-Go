import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatParticipants,
  ChatRooms,
  Messages,
  OrderOffers,
  OrderOffersRepository,
  Orders,
} from 'src/core';
import { CreateOrderOfferDto } from './dto/create-order-offer.dto';
import { UpdateOrderOfferDto } from './dto/update-order-offer.dto';
import { FindManyOptions, FindOneOptions, DataSource, Not } from 'typeorm';
import {
  ChatParticipantRole,
  MessageType,
  OrderOfferStatus,
  OrderStatus,
} from 'src/common/enum';

@Injectable()
export class OrderOffersService {
  constructor(
    @InjectRepository(OrderOffers)
    private readonly repository: OrderOffersRepository,
    private readonly dataSource: DataSource,
  ) {}
  async create(dto: CreateOrderOfferDto) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Orders, {
        where: { id: dto.order_id },
        relations: ['user'],
      });

      if (!order) throw new NotFoundException('Order not found');

      const offered = await manager.count(OrderOffers, {
        where: {
          order: { id: dto.order_id },
          master: { id: dto.master_id },
        },
      });

      if (offered > 0)
        throw new BadRequestException('You already sent offer to this order');

      const newChat = manager.create(ChatRooms, {});
      await manager.save(newChat);

      const newOffer = manager.create(OrderOffers, {
        ...dto,
        chat_room: { id: newChat.id },
        master: { id: dto.master_id },
        order: { id: dto.order_id },
      });
      await manager.save(newOffer);

      const userParticipant = manager.create(ChatParticipants, {
        chat: { id: newChat.id },
        user_id: order.user.id,
        role: ChatParticipantRole.USER,
      });

      const masterParticipant = manager.create(ChatParticipants, {
        chat: { id: newChat.id },
        user_id: dto.master_id,
        role: ChatParticipantRole.MASTER,
      });

      await manager.save(userParticipant);
      await manager.save(masterParticipant);

      const newMessage = manager.create(Messages, {
        content: newOffer.message,
        chat_room: newChat,
        type: MessageType.OFFER,
        sender: masterParticipant,
      });

      await manager.save(newMessage);

      return {
        status_code: 201,
        message: 'Offer created successfully',
        data: {
          offer: newOffer,
          chat: {
            participants: [userParticipant, masterParticipant],
            message: newMessage,
          },
        },
      };
    });
  }

  async findAll(options?: FindManyOptions<OrderOffers>) {
    const offers = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Offers fetched succsessfuly',
      data: offers,
    };
  }

  async findOne(options: FindOneOptions<OrderOffers>) {
    const offer = await this.repository.findOne(options);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return {
      status_code: 200,
      mssage: 'Offer fetched succsessfuly',
      data: offer,
    };
  }

  async acceptOffer(id: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const offer = await manager.findOne(OrderOffers, {
        where: { id },
        relations: ['order', 'chat_room', 'chat_room.participants'],
      });

      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      const participant = offer.chat_room.participants.find(
        (p) => p.user_id === userId,
      );

      if (!participant) {
        throw new ForbiddenException(
          'Forbidden user (you are not a participant of this chat)',
        );
      }
      if (offer.status === OrderOfferStatus.ACCEPTED) {
        throw new BadRequestException('Offer already accepted');
      }

      offer.status = OrderOfferStatus.ACCEPTED;
      await manager.save(offer);

      await manager.update(
        OrderOffers,
        {
          order: { id: offer.order.id },
          id: Not(id),
          status: OrderOfferStatus.PENDING,
        },
        { status: OrderOfferStatus.REJECTED },
      );

      await manager.update(
        Orders,
        {
          id: offer.order.id,
        },
        {
          status: OrderStatus.IN_PROGRESS,
        },
      );

      const newMessage = manager.create(Messages, {
        content: 'Your offer has been accepted',
        sender: { id: participant.id },
        type: MessageType.OFFER_RESPONSE,
        chat_room: { id: offer.chat_room.id },
      });

      await manager.save(newMessage);

      return {
        status_code: 200,
        message: 'Order accepted successfuly',
        data: {
          offer,
          participants: offer.chat_room.participants,
          message: newMessage,
        },
      };
    });
  }

  async rejectOffer(offerId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const offer = await manager.findOne(OrderOffers, {
        where: { id: offerId },
        relations: ['chat_room', 'chat_room.participants', 'order'],
      });

      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      const participants = offer.chat_room.participants ?? [];
      const participant = participants.find((p) => p.user_id === userId);

      if (!participant) {
        throw new ForbiddenException(
          'Forbidden user (you are not a participant of this chat)',
        );
      }

      if (offer.status === OrderOfferStatus.REJECTED) {
        throw new BadRequestException('Offer already rejected');
      }

      offer.status = OrderOfferStatus.REJECTED;
      await manager.save(offer);

      const newMessage = manager.create(Messages, {
        content: 'Your offer has been rejected',
        sender: { id: participant.id },
        type: MessageType.OFFER_RESPONSE,
        chat_room: { id: offer.chat_room.id },
      });
      await manager.save(newMessage);

      return {
        status_code: 200,
        message: 'Offer rejected successfuly',
        data: {
          offer,
          participants: offer.chat_room.participants,
          message: newMessage,
        },
      };
    });
  }

  async update(id: string, dto: UpdateOrderOfferDto, userId: string) {
    await this.findOne({ where: { id, master: { id: userId } } });
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Offer updated succsessfuly',
      data: (await this.findOne({ where: { id } })).data,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne({ where: { id, master: { id: userId } } });
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Offer deleted succsessful',
      data: {},
    };
  }
}
