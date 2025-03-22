<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Mail\ContactFormMail;

class ContactController extends Controller
{
    /**
     * Handle the contact form submission
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function submit(Request $request)
    {
        // Verify app key
        if ($request->header('X-App-Key') !== 'mgdy ctks dmlj ypyc') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Validate form data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            // Send email
            Mail::to(config('mail.admin_email', 'admin@trustchain.org'))
                ->send(new ContactFormMail($request->all()));

            return response()->json(['message' => 'Email sent successfully'], 200);
        } catch (\Exception $e) {
            // More detailed logging
            \Log::error('Contact form email error: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all(),
                'mail_config' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'from' => config('mail.from'),
                    'admin_email' => config('mail.admin_email')
                ]
            ]);
            
            return response()->json(['message' => 'Failed to send email: ' . $e->getMessage()], 500);
        }
    }
} 