import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  experience: string;

  @Column('text')
  coverLetter: string;

  @Column({ nullable: true })
  cvKey: string;

  @Column({ nullable: true })
  cvUrl: string;

  @Column({ nullable: true })
  videoKey: string;

  @Column({ nullable: true })
  videoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
