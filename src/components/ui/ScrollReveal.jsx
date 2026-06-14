import { useEffect, useRef } from 'react';

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  scale = false,
  as: Tag = 'div',
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('fs-scroll-revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`fs-scroll-reveal${scale ? ' fs-scroll-reveal-scale' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--fs-reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
