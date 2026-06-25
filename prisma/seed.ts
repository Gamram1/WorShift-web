import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SAMPLE_SONGS = [
  { title: '주님 한 분만으로', genre: 'CCM',  key: 'G',  worshipTypes: ['주일예배'] },
  { title: '거룩하신 하나님',   genre: 'CCM',  key: 'C',  worshipTypes: ['주일예배', '금요예배'] },
  { title: '사랑해요 목소리 높여', genre: 'CCM', key: 'D', worshipTypes: ['주일예배'] },
  { title: '내 삶을 가득 채우소서', genre: 'CCM', key: 'A', worshipTypes: ['금요예배'] },
  { title: '주 이름 찬양',       genre: 'CCM',  key: 'Bb', worshipTypes: ['주일예배', '특별예배'] },
  { title: '아 하나님의 은혜로', genre: '찬송가', key: 'C', worshipTypes: ['주일예배'] },
  { title: '주 하나님 독생자 예수', genre: '찬송가', key: 'G', worshipTypes: ['주일예배'] },
  { title: '내 평생에 가는 길', genre: '찬송가', key: 'D', worshipTypes: ['주일예배', '특별예배'] },
  { title: '나 같은 죄인 살리신', genre: '찬송가', key: 'F', worshipTypes: ['주일예배'] },
  { title: '찬양하라 내 영혼아', genre: '찬송가', key: 'A', worshipTypes: ['주일예배', '금요예배'] },
];

async function main() {
  console.log('시드 데이터 입력 중...');
  await prisma.song.deleteMany();
  for (const song of SAMPLE_SONGS) {
    await prisma.song.create({ data: song });
  }
  console.log(`✅ 샘플 곡 ${SAMPLE_SONGS.length}개 입력 완료`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
