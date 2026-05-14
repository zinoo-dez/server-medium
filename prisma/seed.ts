import { PrismaClient, Role, ArticleStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medium.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@medium.com',
      passwordHash,
      displayName: 'System Admin',
      role: Role.ADMIN,
      bio: 'The system administrator.',
    },
  });

  // 2. Create Users
  const users = await Promise.all(
    Array.from({ length: 4 }).map((_, i) =>
      prisma.user.upsert({
        where: { email: `user${i}@medium.com` },
        update: {},
        create: {
          username: `user${i}`,
          email: `user${i}@medium.com`,
          passwordHash,
          displayName: `User ${i}`,
          role: Role.USER,
          bio: `This is the bio for user ${i}`,
        },
      })
    )
  );

  const allUsers = [admin, ...users];

  // 3. Create Tags
  const tags = await Promise.all(
    ['Technology', 'Programming', 'Design', 'Life', 'Startup'].map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: {
          name,
          slug: name.toLowerCase(),
          description: `All about ${name}`,
        },
      })
    )
  );

  // 4. Create Articles
  console.log('Creating articles...');
  const articles = [];
  for (let i = 0; i < 20; i++) {
    const author = allUsers[i % allUsers.length];
    const article = await prisma.article.create({
      data: {
        authorId: author.id,
        title: `Sample Article ${i}`,
        slug: `sample-article-${i}`,
        content: {
          blocks: [
            { type: 'paragraph', data: { text: `This is the content of article ${i}.` } },
          ],
        },
        excerpt: `This is the excerpt of article ${i}.`,
        status: ArticleStatus.PUBLISHED,
        readingTime: 2,
        publishedAt: new Date(),
        tags: {
          create: [
            { tagId: tags[i % tags.length].id },
            { tagId: tags[(i + 1) % tags.length].id },
          ],
        },
      },
    });
    articles.push(article);
  }

  // 5. Create Comments
  console.log('Creating comments...');
  for (let i = 0; i < 20; i++) {
    const article = articles[i];
    const user = allUsers[(i + 1) % allUsers.length];
    await prisma.comment.create({
      data: {
        articleId: article.id,
        userId: user.id,
        content: `Great article! Very helpful.`,
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
