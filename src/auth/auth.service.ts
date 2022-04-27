import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    async signup (dto: AuthDto) {
        //generate password hash
        const hash = await argon.hash(dto.password);
        // save user
        try {
            
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash: hash
                },
                // posso dichiarare esplicitamente quali dati ottenere in risposta
                // select: {
                //     id: true
                // }
            });
    
            return this.signToken(user.id, user.email);// return jwt

        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException("Credential takens")
                }
            }
        }
        
    }

    async signin (dto: AuthDto) {

        // find the user by email
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email
            }
        })

        // if user does not exist throw exception
        if (!user) {
            throw new ForbiddenException('Credentials incorrect');
        }
        // compare password
        const pswMatch = await argon.verify(user.hash, dto.password);
        // if password is not correct throw exception
        if (!pswMatch) {
            throw new ForbiddenException('Credentials incorrect');
        }

        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{access_token: string}> {
        const payload = {
            sub: userId,
            email
        }

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',// expires in 15 min
            secret: this.config.get("JWT_SECRET")
        })

        return {access_token: token}

    }

}