FROM php:8.2-fpm
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt update \
    && apt install -y zlib1g-dev g++ git libicu-dev zip libzip-dev zip \
    && docker-php-ext-install intl opcache pdo pdo_mysql \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip

WORKDIR /var/www/SquadUp
COPY ./SquadUpCore/ .

RUN curl -sS https:///getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN curl -sS https://get.symfony.com/cli/installer | bash
RUN mv /root/.symfony5/bin/symfony /usr/local/bin/symfony
RUN git config --global user.email "mattia.andreolli1@gmail.com" \
    && git config --global user.name "Mattia Andreolli"
RUN composer update --no-interaction