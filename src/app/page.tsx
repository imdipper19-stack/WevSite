'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Coins,
  Shield,
  Zap,
  MessageCircle,
  Star,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Check,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ReviewsCarousel } from '@/components/landing/ReviewsCarousel';
import { TelegramWidget } from '@/components/landing/TelegramWidget';

// Helper for Russian pluralization
function getNoun(number: number, one: string, two: string, five: string) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}

// Pricing tiers for coin packages
const coinPackages = [
  { amount: 30, price: 45, popular: false },
  { amount: 100, price: 150, popular: false },
  { amount: 500, price: 750, popular: false },
  { amount: 1000, price: 1500, popular: true },
  { amount: 5000, price: 7500, popular: false },
  { amount: 10000, price: 15000, popular: false },
];

const starsPackages = [
  { amount: 50, price: 75, popular: false },
  { amount: 100, price: 150, popular: false },
  { amount: 250, price: 375, popular: false },
  { amount: 500, price: 750, popular: true },
  { amount: 1000, price: 1500, popular: false },
  { amount: 2500, price: 3750, popular: false },
  { amount: 5000, price: 7500, popular: false },
  { amount: 10000, price: 15000, popular: false },
];

const features = [
  {
    icon: Zap,
    title: 'Мгновенная доставка',
    description: 'Монеты поступают на ваш аккаунт в течение нескольких минут после оплаты',
  },
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Все данные защищены шифрованием AES-256 и автоматически удаляются',
  },
  {
    icon: MessageCircle,
    title: 'Поддержка 24/7',
    description: 'Наша команда готова помочь вам в любое время суток',
  },
  {
    icon: Star,
    title: 'Гарантия качества',
    description: 'Полный возврат средств, если что-то пойдет не так',
  },
];

const stats = [
  { value: '50K+', label: 'Довольных клиентов', icon: Users },
  { value: '1M+', label: 'Монет продано', icon: Coins },
  { value: '<5 мин', label: 'Среднее время доставки', icon: Clock },
  { value: '4.9★', label: 'Средний рейтинг', icon: TrendingUp },
];

const reviews = [
  {
    name: 'Анна М.',
    rating: 5,
    text: 'Очень быстро и удобно! Монеты пришли за 3 минуты. Буду заказывать ещё!',
    avatar: 'А',
  },
  {
    name: 'Дмитрий К.',
    rating: 5,
    text: 'Отличный сервис, поддержка ответила мгновенно. Рекомендую!',
    avatar: 'Д',
  },
  {
    name: 'Елена П.',
    rating: 5,
    text: 'Уже третий раз заказываю здесь. Всё чётко, без проблем.',
    avatar: 'Е',
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<'coins' | 'stars'>('coins');
  const [selectedPackage, setSelectedPackage] = useState(coinPackages[3]);
  const [realStats, setRealStats] = useState<any>(null);
  const [realReviews, setRealReviews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Stats
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(data => {
        if (data.clients > 0 || data.coinsSold > 0) {
          setRealStats(data);
        }
      })
      .catch(console.error);

    // Fetch Reviews
    fetch('/api/public/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.reviews && data.reviews.length > 0) {
          setRealReviews(data.reviews);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Vidlecta</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                Преимущества
              </Link>
              <Link href="#pricing" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                Цены
              </Link>
              <Link href="#reviews" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                Отзывы
              </Link>
              <Link href="#faq" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                FAQ
              </Link>
              <a href="https://t.me/BAG1BAG1" target="_blank" rel="noopener noreferrer" className="text-[var(--foreground-muted)] hover:text-[#0088cc] transition-colors font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0088cc] animate-pulse"></span>
                Поддержка
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Регистрация
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[var(--foreground)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[var(--border)] animate-slideUp">
              <div className="flex flex-col gap-4">
                <Link href="#features" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                  Преимущества
                </Link>
                <Link href="#pricing" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                  Цены
                </Link>
                {/* Reviews Link hidden */}
                <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" size="sm" fullWidth>
                      Войти
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button variant="primary" size="sm" fullWidth>
                      Регистрация
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#6A11CB]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#2575FC]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Badge - HIDDEN as per request "no fake data" */}

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slideUp text-center">
              Быстрая покупка <br className="hidden sm:block" />
              <span className="gradient-text">TikTok монет</span> и <span className="text-[#FFC107]">Telegram Stars</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--foreground-muted)] mb-10 max-w-2xl mx-auto animate-slideUp text-center" style={{ animationDelay: '0.1s' }}>
              Надёжный сервис для пополнения монет TikTok и Telegram Stars. Моментальная доставка, безопасные платежи, поддержка 24/7.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <Link href="#pricing">
                <Button variant="accent" size="lg" rightIcon={<ArrowRight size={20} />}>
                  Купить монеты
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" size="lg">
                  Узнать больше
                </Button>
              </Link>
            </div>

            {/* Trust Badges - HIDDEN as per request "no fake data" */}
            {/* <div className="flex flex-wrap justify-center gap-6 mt-12 pt-12 border-t border-[var(--border)]">...</div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[var(--background-alt)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
              Почему выбирают <span className="gradient-text">Vidlecta</span>?
            </h2>
            <p className="text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto text-center">
              Мы создали удобную и безопасную платформу для покупки TikTok монет
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:border-[var(--primary)]/30 group flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#6A11CB]/10 to-[#2575FC]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--foreground-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - kept as is */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
              Выберите пакет <span className={activeProduct === 'coins' ? 'gradient-text' : 'text-[#FFC107]'}>
                {activeProduct === 'coins' ? 'монет' : 'звёзд'}
              </span>
            </h2>
            <p className="text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto text-center font-medium mb-8">
              Цена всего 1.5₽ за 1 {activeProduct === 'coins' ? 'монету' : 'звезду'}. Выберите подходящий пакет.
            </p>

            {/* Toggle */}
            <div className="flex items-center gap-2 bg-[var(--background-alt)] p-1 rounded-xl mb-8 border border-[var(--border)]">
              <button
                onClick={() => { setActiveProduct('coins'); setSelectedPackage(coinPackages[3]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${activeProduct === 'coins' ? 'bg-[var(--background)] shadow-sm text-[var(--foreground)]' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
              >
                <Coins size={18} className={activeProduct === 'coins' ? 'text-[var(--accent)]' : ''} />
                TikTok Coins
              </button>
              <button
                onClick={() => { setActiveProduct('stars'); setSelectedPackage(starsPackages[3]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${activeProduct === 'stars' ? 'bg-[var(--background)] shadow-sm text-[var(--foreground)]' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
              >
                <Star size={18} className={activeProduct === 'stars' ? 'text-[#FFC107]' : ''} />
                Telegram Stars
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Package Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {(activeProduct === 'coins' ? coinPackages : starsPackages).map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200
                    ${selectedPackage.amount === pkg.amount
                      ? activeProduct === 'coins' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[#FFC107] bg-[#FFC107]/5'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                    }
                  `}
                >
                  {pkg.popular && (
                    <span className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 ${activeProduct === 'coins' ? 'bg-[var(--accent)]' : 'bg-[#FFC107] text-black'} text-white text-xs font-medium rounded-full`}>
                      Популярный
                    </span>
                  )}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {activeProduct === 'coins' ? (
                        <Coins className="w-4 h-4 text-[var(--accent)]" />
                      ) : (
                        <Star className="w-4 h-4 text-[#FFC107]" />
                      )}
                      <span className="font-bold text-lg">{pkg.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-[var(--foreground-muted)]">
                      {pkg.price.toLocaleString()}₽
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Package */}
            <div className="card p-8 bg-gradient-to-r from-[#6A11CB]/5 to-[#2575FC]/5 border-[var(--primary)]/20">
              <div className="flex flex-col items-center justify-center gap-6 text-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {activeProduct === 'coins' ? (
                      <Coins className="w-8 h-8 text-[var(--accent)]" />
                    ) : (
                      <Star className="w-8 h-8 text-[#FFC107]" />
                    )}
                    <span className="text-4xl font-bold">
                      {selectedPackage.amount.toLocaleString()}
                    </span>
                    <span className="text-[var(--foreground-muted)]">
                      {activeProduct === 'coins' ? 'монет' : 'звёзд'}
                    </span>
                  </div>
                  <p className="text-[var(--foreground-muted)]">
                    {activeProduct === 'coins'
                      ? 'Моментальная доставка после оплаты'
                      : 'Автоматическое зачисление через Fragment'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {selectedPackage.price.toLocaleString()}
                    <span className="text-lg text-[var(--foreground-muted)]">₽</span>
                  </div>
                  <Link href="/register">
                    <Button variant="accent" size="lg" rightIcon={<ChevronRight size={20} />}>
                      Оплатить
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Real Data Only */}
      {realReviews.length > 0 && (
        <section id="reviews" className="py-20 bg-[var(--background-alt)] overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Отзывы наших <span className="gradient-text">клиентов</span>
              </h2>
            </div>

            <ReviewsCarousel reviews={realReviews} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center card p-12 bg-gradient-to-r from-[#6A11CB] to-[#2575FC] border-none">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center w-full">
              Готовы пополнить баланс?
            </h2>
            <p className="text-lg text-white/80 mb-8 mx-auto text-center px-4 w-full">
              Присоединяйтесь к тысячам довольных клиентов. <br className="hidden sm:block" />
              Регистрация займет всего минуту!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button
                  variant="accent"
                  size="lg"
                  className="bg-white hover:bg-white/90 !text-[#6A11CB] min-w-[200px]"
                >
                  Зарегистрироваться
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="accent"
                  size="lg"
                  className="bg-transparent border-2 border-white hover:bg-white/10 text-white min-w-[200px]"
                >
                  Войти в аккаунт
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Vidlecta</span>
              </Link>
              <p className="text-[var(--foreground-muted)] max-w-sm">
                Надёжная платформа для покупки TikTok монет и Telegram Stars. Быстро, безопасно и по лучшей цене.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Навигация</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">Преимущества</Link></li>
                <li><Link href="#pricing" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">Цены</Link></li>
                <li><Link href="#reviews" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">Отзывы</Link></li>
                <li><Link href="#faq" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Правовая информация</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">Политика конфиденциальности</Link></li>
                <li><Link href="/terms" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">Пользовательское соглашение</Link></li>
                <li><Link href="/refund" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">Возврат средств</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--foreground-muted)]">
              © 2026 Vidlecta. Все права защищены.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--success)]" />
                <span className="text-sm text-[var(--foreground-muted)]">SSL защита</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--success)]" />
                <span className="text-sm text-[var(--foreground-muted)]">Безопасные платежи</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <TelegramWidget />
    </div>
  );
}
