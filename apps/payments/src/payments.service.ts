import { Inject, Injectable } from '@nestjs/common';
import { PaymentDto } from './payment.dto';
import { PrismaService } from './prisma/prisma.service';
import { PaymentStatus } from '.prisma/client/payments';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  constructor(
    private prismaService: PrismaService,
    @Inject('PAYMENTS_SERVICE')
    private kafkaClient: ClientKafka,
  ) {}

  all() {
    return this.prismaService.payment.findMany();
  }

  async payment(data: PaymentDto) {
    const payment = await this.prismaService.payment.create({
      data: {
        ...data,
        status: PaymentStatus.APPROVED,
      },
    });

    await lastValueFrom(this.kafkaClient.emit('payments', payment)); // primeiro parâmetro é o nome do tópico, o segundo é o valor que será publicado na fila

    return payment;
  }
}
