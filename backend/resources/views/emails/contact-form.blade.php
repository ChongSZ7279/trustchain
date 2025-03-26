@component('mail::message')
# New Contact Form Submission

**From:** {{ $name }} ({{ $email }})  
**Subject:** {{ $subject }}

## Message:
{{ $messageContent }}

@component('mail::button', ['url' => config('app.url')])
Visit Website
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent 