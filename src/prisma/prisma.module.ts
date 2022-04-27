import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()// questo service è valido a livello globale quindi posso usarlo senza dover fare import ogni volta
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
