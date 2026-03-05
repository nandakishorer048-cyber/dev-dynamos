import { useEffect, useRef, useCallback } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
    const { threshold = 0.1, rootMargin = '0px 0px -60px 0px', once = true } = options;
    const ref = useRef<HTMLDivElement>(null);

    const handleIntersect = useCallback(
        (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    if (once) {
                        observer.unobserve(entry.target);
                    }
                } else if (!once) {
                    entry.target.classList.remove('revealed');
                }
            });
        },
        [once]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersect, {
            threshold,
            rootMargin,
        });

        const el = ref.current;
        if (el) {
            observer.observe(el);
        }

        return () => {
            if (el) observer.unobserve(el);
        };
    }, [handleIntersect, threshold, rootMargin]);

    return ref;
}

// Hook to reveal multiple children with stagger
export function useStaggerReveal(containerSelector?: string) {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Find all scroll-reveal children and stagger them
                        const children = entry.target.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
                        children.forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('revealed');
                            }, index * 100);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
        );

        // Observe containers
        const selector = containerSelector || '[data-stagger-reveal]';
        const containers = document.querySelectorAll(selector);
        containers.forEach((container) => observer.observe(container));

        return () => observer.disconnect();
    }, [containerSelector]);
}

// Auto-init scroll reveal for all elements with scroll-reveal classes
export function useAutoScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
        );

        const elements = document.querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
        );
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}
