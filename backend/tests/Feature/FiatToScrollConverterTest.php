<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Charity;
use Illuminate\Support\Facades\Log;

class FiatToScrollConverterTest extends TestCase
{
    use RefreshDatabase, WithFaker;
    
    /**
     * Test fiat to scroll conversion rates endpoint.
     */
    public function test_can_get_conversion_rates()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->getJson('/api/scroll-conversion-rates?currency=USD');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'currency',
                    'scroll_price',
                    'timestamp'
                ]
            ]);
    }
    
    /**
     * Test the fiat to scroll conversion process.
     */
    public function test_can_convert_fiat_to_scroll()
    {
        $user = User::factory()->create();
        $charity = Charity::factory()->create();
        
        $paymentData = [
            'amount' => 50.00,
            'currency' => 'USD',
            'charity_id' => $charity->id,
            'is_anonymous' => false,
            'message' => 'Test donation',
            'payment_intent_id' => 'pi_' . $this->faker->md5
        ];
        
        $response = $this->actingAs($user)
            ->postJson('/api/process-fiat-donation', $paymentData);
        
        Log::info('Fiat to Scroll test response', [
            'status' => $response->status(),
            'content' => $response->json()
        ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'donation',
                'transaction',
                'conversion_details' => [
                    'fiat_amount',
                    'fiat_currency',
                    'scroll_amount',
                    'exchange_rate'
                ]
            ]);
        
        // Check that a donation was created in the database
        $this->assertDatabaseHas('donations', [
            'user_id' => $user->ic_number,
            'cause_id' => $charity->id,
            'payment_method' => 'fiat_to_scroll',
            'fiat_currency' => 'USD',
        ]);
        
        // Check that a transaction was created
        $this->assertDatabaseHas('transactions', [
            'user_ic' => $user->ic_number,
            'charity_id' => $charity->id,
            'type' => 'fiat_to_scroll',
        ]);
    }
} 