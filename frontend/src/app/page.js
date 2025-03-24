'use client';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import styles from './styles/Home.module.css';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const router = useRouter();
  const {isAuthenticated} = useAuth();

  return (
    <div className={styles.container}>
      <Head>
        <title>Clinic Management System</title>
        <meta name="description" content="Manage your clinic efficiently with our system." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Welcome to Our Clinic</h1>
            <p>Your health is our priority. We provide the best medical services in town.</p>
            {!isAuthenticated && (<button className={styles.loginButton} onClick={() => router.push('/pages/login')}>
              Login
            </button>)}
          </div>
          <div className={styles.heroImage}>
            <img src="/images/hero-image.jpg" alt="Clinic Hero" />
          </div>
        </section>
      </main>
    </div>
  );
}
