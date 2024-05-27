<?php
namespace App\Util;

/**
 * Attribute used to allow anonymous access to a controller or a controller method.
 */
#[\Attribute(\Attribute::TARGET_CLASS | \Attribute::TARGET_METHOD)]
interface AllowAnonymous
{}