import { Inject, Injectable } from '@nestjs/common';
import { OrderDto } from './order.dto';
import { PrismaService } from './prisma/prisma.service';
import { OrderStatus } from '.prisma/client/orders';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private prismaService: PrismaService,
    @Inject('ORDERS_SERVICE')
    private kafkaClient: ClientKafka,
  ) {}

  all() {
    return this.prismaService.order.findMany();
  }

  async create(data: OrderDto) {
    const order = await this.prismaService.order.create({
      data: {
        ...data,
        status: OrderStatus.PENDING,
      },
    });

    await lastValueFrom(this.kafkaClient.emit('orders', order)); // primeiro parâmetro é o nome do tópico, o segundo é o valor que será publicado na fila
    return order;
  }

  complete(id: number, status: OrderStatus) {
    console.log(id, status);
    return this.prismaService.order.update({
      where: { id },
      data: { status },
    });
  }
}
