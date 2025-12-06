<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Auth\EmailVerificationRequest;

final class UpdateEmailVerificationRequest extends EmailVerificationRequest
{
    // No additional rules needed; inherits from EmailVerificationRequest
}
