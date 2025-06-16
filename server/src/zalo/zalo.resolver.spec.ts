import { Test, TestingModule } from '@nestjs/testing';
import { ZaloResolver } from './zalo.resolver';

describe('ZaloResolver', () => {
  let resolver: ZaloResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZaloResolver],
    }).compile();

    resolver = module.get<ZaloResolver>(ZaloResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
