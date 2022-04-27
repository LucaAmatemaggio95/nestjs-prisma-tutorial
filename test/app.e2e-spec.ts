import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";

import * as pactum from 'pactum';
import { AuthDto } from "src/auth/dto";

describe('App e2e', () => {

  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {// importo tutto

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));

    await app.init();
    await app.listen(5000);

    pactum.request.setBaseUrl('http://localhost:5000');

    prisma = app.get(PrismaService);

    await prisma.cleanDb();

  });

  afterAll(() => {
    app.close();
  })

  describe('Auth', () => {

    const dto: AuthDto = {
      email: 'abc@def.com',
      password: '123'
    }

    describe('SignUp', () => {

      it('should throw exc', () => {
        return pactum.spec()
                .post('/auth/signup')
                .withBody({
                  password: dto.password
                })
                .expectStatus(400)
      })

      it('should sign up', () => {
        
        return pactum.spec()
                .post('/auth/signup')
                .withBody(dto)
                .expectStatus(201)
      })
    })

    describe('SignIn', () => {
      it('should sign in', () => {
        return pactum.spec()
                .post('/auth/signin')
                .withBody(dto)
                .expectStatus(201)
      })
    })
  })
  
  describe('Users', () => {
    describe('GetMe', () => {})

    describe('EditUser', () => {})
  })

  describe('Bookmarks', () => {
    describe('GetBookmarks', () => {})

    describe('CreateBookmark', () => {})

    describe('GetBookmarksById', () => {})

    describe('EditBookmarks', () => {})

    describe('DeleteBookmarks', () => {})

  })

})