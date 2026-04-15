// ========== МОДАЛЬНОЕ ОКНО ==========
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModal');
const openModalHeroBtn = document.getElementById('openModalHero');
const closeModalBtn = document.querySelector('.modal__close');

function openModal() {
    if (modal && modalOverlay) {
        modal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (modal && modalOverlay) {
        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Кнопки открытия
if (openModalBtn) openModalBtn.addEventListener('click', openModal);
if (openModalHeroBtn) openModalHeroBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

// Escape для модалки
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal && modal.classList.contains('active')) closeModal();
        closeLightbox();
    }
});

// ========== ВАЛИДАЦИЯ ТЕЛЕФОНА (Беларусь) ==========
function validatePhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phonePattern = /^(\+375|8)(29|33|44|25|17)\d{7}$/;
    return phonePattern.test(cleanPhone);
}

function formatPhoneInput(input) {
    let value = input.value.replace(/[^\d+]/g, '');
    if (value.startsWith('375')) value = '+' + value;
    input.value = value;
}

// ========== LIGHTBOX ==========
function openLightbox(imgSrc, imgAlt) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (lightbox && lightboxImg && lightboxCaption) {
        lightboxImg.src = imgSrc;
        lightboxImg.alt = imgAlt;
        lightboxCaption.textContent = imgAlt;
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ========== АКЦИЯ: АВТООБНОВЛЕНИЕ ДАТЫ ==========
function updatePromoDate() {
    const dateElement = document.querySelector('.hero__promo-date-number');
    if (dateElement) {
        const today = new Date();
        const options = { day: 'numeric', month: 'long' };
        dateElement.textContent = today.toLocaleDateString('ru-RU', options);
    }
}

// ========== БУРГЕР-МЕНЮ (МОБИЛЬНАЯ ВЕРСИЯ) ==========
function initBurgerMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    
    if (burger && nav) {
        console.log('✅ Бургер-меню найдено');
        
        burger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            burger.classList.toggle('active');
            nav.classList.toggle('active');
            
            // Блокируем/разблокируем прокрутку страницы
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Закрываем меню при клике на ссылку
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                burger.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Закрываем меню при клике вне его
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !burger.contains(e.target)) {
                burger.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    } else {
        console.error('❌ Бургер-меню не найдено! Проверьте ID burger и nav');
    }
}

// ========== ОТПРАВКА ФОРМ ==========
document.addEventListener('DOMContentLoaded', function() {
    // Автообновление даты
    updatePromoDate();
    
    // Инициализация бургер-меню
    initBurgerMenu();
    
    // Форматирование телефонов
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() { formatPhoneInput(this); });
    });
    
    // Обработка всех форм с классом ajax-form
    const forms = document.querySelectorAll('.ajax-form');
    console.log('✅ Найдено форм:', forms.length);
    
    forms.forEach(form => {
        let isSubmitting = false;
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isSubmitting) {
                alert('⏳ Заявка уже отправляется. Подождите...');
                return;
            }
            
            // Проверка телефона
            const phoneField = this.querySelector('input[type="tel"]');
            if (phoneField && !validatePhone(phoneField.value)) {
                alert('❌ Введите номер в формате +375XXXXXXXXX (9 цифр после кода)');
                phoneField.focus();
                return;
            }
            
            // Проверка имени
            const nameField = this.querySelector('input[name="name"]');
            if (nameField && !nameField.value.trim()) {
                alert('❌ Пожалуйста, укажите ваше имя');
                nameField.focus();
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            isSubmitting = true;
            
            const formData = new FormData(this);
            formData.append('page_url', window.location.href);
            
            try {
                const response = await fetch('https://balkony-bot-worker.balkonomania.workers.dev', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Заявка отправлена! Мы свяжемся с вами.');
                    this.reset();
                    
                    // ПРИНУДИТЕЛЬНОЕ ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
                    if (modal) modal.classList.remove('active');
                    if (modalOverlay) modalOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    
                } else {
                    alert('❌ Ошибка: ' + result.message);
                }
            } catch (error) {
                console.error(error);
                alert('❌ Ошибка соединения. Проверьте интернет.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                isSubmitting = false;
            }
        });
    });
});

// ========== АВТОМАТИЧЕСКАЯ МАСКА ТЕЛЕФОНА +375 ==========
function setupPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        // Добавляем +375 при фокусе, если поле пустое
        input.addEventListener('focus', function() {
            if (this.value === '') {
                this.value = '+375';
            }
        });
        
        // Ограничиваем ввод и форматируем
        input.addEventListener('input', function(e) {
            let value = this.value;
            
            // Удаляем все не-цифры, но сохраняем +
            let cleaned = value.replace(/[^\d+]/g, '');
            
            // Если нет +375 в начале, добавляем
            if (!cleaned.startsWith('+375')) {
                if (cleaned.startsWith('375')) {
                    cleaned = '+' + cleaned;
                } else if (cleaned.startsWith('+')) {
                    // Оставляем как есть
                } else if (cleaned.length > 0) {
                    cleaned = '+375' + cleaned;
                } else {
                    cleaned = '+375';
                }
            }
            
            // Ограничиваем длину (+375 + 9 цифр = 13 символов)
            if (cleaned.length > 13) {
                cleaned = cleaned.slice(0, 13);
            }
            
            this.value = cleaned;
        });
        
        // При потере фокуса, если остался только +375, очищаем поле
        input.addEventListener('blur', function() {
            if (this.value === '+375') {
                this.value = '';
            }
        });
    });
}

// Запускаем маску телефона
document.addEventListener('DOMContentLoaded', setupPhoneMask);

// ========== ТАЙМЕР АКЦИИ ДО КОНЦА ДНЯ ==========
function updateTimer() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const diff = endOfDay - now;
    
    if (diff <= 0) {
        // Если время вышло, показываем 00:00:00
        document.getElementById('timerHours').textContent = '00';
        document.getElementById('timerMinutes').textContent = '00';
        document.getElementById('timerSeconds').textContent = '00';
        return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
    const seconds = Math.floor((diff % (60000)) / 1000);
    
    document.getElementById('timerHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('timerMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('timerSeconds').textContent = String(seconds).padStart(2, '0');
}

// Запускаем таймер
setInterval(updateTimer, 1000);
updateTimer();

// Обновление даты (оставляем как было)
function updatePromoDate() {
    const dateElement = document.getElementById('promoDate');
    if (dateElement) {
        const today = new Date();
        const options = { day: 'numeric', month: 'long' };
        dateElement.textContent = today.toLocaleDateString('ru-RU', options);
    }
}
document.addEventListener('DOMContentLoaded', updatePromoDate);

// ========== СКРЫТИЕ ШАПКИ ПРИ СКРОЛЛЕ ВНИЗ ==========
let lastScrollTop = 0;
const header = document.querySelector('.header');
const SCROLL_THRESHOLD = 50; // Через сколько пикселей скрывать

window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Проверяем направление скролла
    if (currentScroll > lastScrollTop && currentScroll > SCROLL_THRESHOLD) {
        // Скролл ВНИЗ - скрываем шапку
        header.classList.add('header--hidden');
    } else if (currentScroll < lastScrollTop) {
        // Скролл ВВЕРХ - показываем шапку
        header.classList.remove('header--hidden');
    }
    
    // Если мы в самом верху страницы, показываем шапку
    if (currentScroll <= 10) {
        header.classList.remove('header--hidden');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});
