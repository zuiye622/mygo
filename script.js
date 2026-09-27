/**
 * MCCS2 服务器介绍页 - 交互脚本
 * 功能：滚动动画、卡片悬停增强、QQ群号复制、平滑滚动
 */

(function () {
    'use strict';

    /* ============================================================
       1. 页面加载后平滑淡入
       ============================================================ */
    document.addEventListener('DOMContentLoaded', function () {
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            container.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            // 触发重绘后开始动画
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                });
            });
        }

        initScrollReveal();
        initQQCopy();
        initSmoothScroll();
        initCardTilt();
        initCommandClickCopy();
    });

    /* ============================================================
       2. 滚动进入视口时的渐显动画（用于 section、卡片等）
       ============================================================ */
    function initScrollReveal() {
        // 需要动画的元素：每个 section、卡片、FAQ 项、表格行
        const targets = document.querySelectorAll(
            'section, .card, .faq-item, .table-wrap, .map-tag'
        );

        if (!targets.length) return;

        // 初始样式
        targets.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        // IntersectionObserver 检测
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            const el = entry.target;

                            // 卡片使用延迟错开效果
                            if (el.classList.contains('card')) {
                                const cards = Array.from(el.parentElement.children);
                                const index = cards.indexOf(el);
                                el.style.transitionDelay = (index * 0.08) + 's';
                            }

                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0)';
                            observer.unobserve(el);
                        }
                    });
                },
                {
                    threshold: 0.12,
                    rootMargin: '0px 0px -40px 0px'
                }
            );

            targets.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // 降级方案：直接全部显示
            targets.forEach(function (el) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }
    }

    /* ============================================================
       3. 点击 QQ 群号一键复制
       ============================================================ */
    function initQQCopy() {
        const qqElements = document.querySelectorAll('.qq-group');

        qqElements.forEach(function (el) {
            el.style.cursor = 'pointer';
            el.style.transition = 'background 0.2s, box-shadow 0.2s';
            el.setAttribute('title', '点击复制群号');

            el.addEventListener('click', function (e) {
                e.stopPropagation();
                const text = el.textContent.trim();

                copyToClipboard(text).then(function (success) {
                    if (success) {
                        showToast('✅ 群号 ' + text + ' 已复制到剪贴板');
                    } else {
                        showToast('❌ 复制失败，请手动复制：' + text);
                    }
                });
            });

            // 悬停高亮
            el.addEventListener('mouseenter', function () {
                el.style.background = '#143b47';
                el.style.boxShadow = '0 0 12px #3f7e9150';
            });
            el.addEventListener('mouseleave', function () {
                el.style.background = '#0e252e';
                el.style.boxShadow = 'none';
            });
        });
    }

    /**
     * 复制文本到剪贴板（兼容现代与旧版浏览器）
     */
    function copyToClipboard(text) {
        return new Promise(function (resolve) {
            // 优先使用 navigator.clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(function () { resolve(true); })
                    .catch(function () { resolve(fallbackCopy(text)); });
            } else {
                resolve(fallbackCopy(text));
            }
        });
    }

    function fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (err) {
            return false;
        }
    }

    /* ============================================================
       4. 命令点击复制（/mccs2 系列指令）
       ============================================================ */
    function initCommandClickCopy() {
        const commands = document.querySelectorAll('.command');

        commands.forEach(function (el) {
            el.style.cursor = 'pointer';
            el.setAttribute('title', '点击复制指令');

            el.addEventListener('click', function (e) {
                e.stopPropagation();
                const text = el.textContent.trim();

                copyToClipboard(text).then(function (success) {
                    if (success) {
                        showToast('📋 已复制：' + text);
                        // 复制反馈动画
                        el.style.transition = 'background 0.15s, box-shadow 0.15s';
                        el.style.background = '#1d4a56';
                        el.style.boxShadow = '0 0 10px #4fa8bd80';
                        setTimeout(function () {
                            el.style.background = '';
                            el.style.boxShadow = '';
                        }, 400);
                    } else {
                        showToast('❌ 复制失败，请手动复制');
                    }
                });
            });
        });
    }

    /* ============================================================
       5. 全局轻提示 Toast
       ============================================================ */
    function showToast(message) {
        // 移除已有的 toast
        const existing = document.querySelector('.mccs2-toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'mccs2-toast';
        toast.textContent = message;

        // 样式
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%) translateY(20px)',
            background: '#10262e',
            color: '#c2e0ea',
            padding: '12px 28px',
            borderRadius: '40px',
            border: '1px solid #3f7e91',
            boxShadow: '0 12px 28px -8px #000000cc, 0 0 16px #1f4f5e40',
            fontSize: '0.95rem',
            fontWeight: '500',
            letterSpacing: '0.3px',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: 'none',
            maxWidth: '90vw',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        });

        document.body.appendChild(toast);

        // 入场
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(0)';
            });
        });

        // 自动移除
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 350);
        }, 2200);
    }

    /* ============================================================
       6. 平滑滚动（针对锚点链接）
       ============================================================ */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /* ============================================================
       7. 卡片轻微 3D 倾斜效果（鼠标跟随）
       ============================================================ */
    function initCardTilt() {
        // 仅在支持 hover 的设备上启用（排除触摸设备）
        if (window.matchMedia('(hover: none)').matches) return;

        const cards = document.querySelectorAll('.card');

        cards.forEach(function (card) {
            card.style.transformStyle = 'preserve-3d';
            card.style.willChange = 'transform';

            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // 倾斜幅度限制在 ±5 度
                const rotateY = ((x - centerX) / centerX) * 5;
                const rotateX = ((centerY - y) / centerY) * 5;

                card.style.transform =
                    'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-3px)';
                card.style.transition = 'transform 0.08s ease-out';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform =
                    'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
                card.style.transition = 'transform 0.4s ease';
            });
        });
    }

    /* ============================================================
       8. 控制台彩蛋
       ============================================================ */
    console.log(
        '%c MCCS2 %c 我的世界反恐精英2  ·  方块世界，纯粹竞技 ',
        'background:#1d4a56;color:#b0e2f0;font-weight:bold;padding:4px 8px;border-radius:4px 0 0 4px;',
        'background:#0e252e;color:#8ba9b5;padding:4px 8px;border-radius:0 4px 4px 0;'
    );
    console.log('%c 加入 Q 群 908773678 参与测试 ', 'color:#7fc1d4;font-size:12px;');

})();