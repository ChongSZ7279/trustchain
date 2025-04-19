<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:make-admin {ic_number : The IC number of the user to make admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Make a user an admin by IC number';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $icNumber = $this->argument('ic_number');
        
        // Find the user
        $user = User::where('ic_number', $icNumber)->first();
        
        if (!$user) {
            $this->error("User with IC number {$icNumber} not found.");
            return 1;
        }
        
        // Check if already admin
        if ($user->is_admin) {
            $this->info("User {$user->name} is already an admin.");
            return 0;
        }
        
        // Make the user an admin
        $user->is_admin = true;
        $user->save();
        
        $this->info("User {$user->name} has been made an admin successfully!");
        return 0;
    }
}
