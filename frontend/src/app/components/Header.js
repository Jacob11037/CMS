import Link from 'next/link';
import styles from '../styles/Home.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <img src="/images/clinic-logo.png" alt="Clinic Logo" />
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/pages/login">Services</Link>
        <Link href="/pages/login">About Us</Link>
        <Link href="/pages/login">Contact</Link>
      </nav>
    </header>
  );
};

export default Header;