<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Transaction;
use App\Models\Donation;

class FixCurrencyTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Fixing currency types to SCROLL...');

        // Update transactions table
        if (Schema::hasColumn('transactions', 'currency_type')) {
            Transaction::query()->update([
                'currency_type' => 'SCROLL'
            ]);
            $this->command->info('Updated transactions currency_type to SCROLL');
        }

        // Update donations table
        if (Schema::hasColumn('donations', 'currency_type')) {
            Donation::query()->update([
                'currency_type' => 'SCROLL'
            ]);
            $this->command->info('Updated donations currency_type to SCROLL');
        }

        $this->command->info('Currency type fixing completed.');
    }
}
