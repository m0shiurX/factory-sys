<?php

declare(strict_types=1);

namespace App\Data;

use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\ArrayType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Sometimes;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;
use Spatie\Permission\Models\Role;

final class RoleData extends Data
{
    /**
     * @param  array<int, int>|null  $permissions
     */
    public function __construct(
        public ?int $id = null,
        #[Required]
        #[StringType]
        #[Max(255)]
        public ?string $name = null,
        #[Sometimes]
        #[ArrayType]
        public ?array $permissions = null,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(ValidationContext $context): array
    {
        $roleId = is_array($context->payload) ? ($context->payload['id'] ?? null) : null;

        return [
            'name' => [
                Rule::unique(Role::class, 'name')->ignore($roleId),
            ],
            'permissions.*' => [
                'integer',
                'exists:permissions,id',
            ],
        ];
    }

    public static function fromModel(Role $role): self
    {
        /** @var array<int, int> $permissionIds */
        $permissionIds = $role->permissions->pluck('id')->toArray();

        return new self(
            id: (int) $role->id,
            name: $role->name,
            permissions: $permissionIds,
        );
    }
}
