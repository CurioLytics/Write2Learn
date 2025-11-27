'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestVoicePage() {
  const [diagnostics, setDiagnostics] = useState({
    isHTTPS: false,
    hasSpeechRecognition: false,
    hasSpeechSynthesis: false,
    hasMediaDevices: false,
    hasGetUserMedia: false,
    userAgent: '',
    platform: '',
    isAndroid: false,
    isIOS: false,
    protocol: '',
  });

  const [sttStatus, setSTTStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [sttError, setSTTError] = useState('');
  const [sttTranscript, setSTTTranscript] = useState('');

  const [ttsStatus, setTTSStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [ttsError, setTTSError] = useState('');

  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  useEffect(() => {
    // Run diagnostics
    const userAgent = navigator.userAgent.toLowerCase();
    const diag = {
      isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      hasSpeechRecognition: !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition,
      hasSpeechSynthesis: !!window.speechSynthesis,
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isAndroid: /android/.test(userAgent),
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      protocol: window.location.protocol,
    };
    setDiagnostics(diag);

    // Check microphone permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicPermission(result.state as any);
        result.addEventListener('change', () => {
          setMicPermission(result.state as any);
        });
      }).catch(() => {
        setMicPermission('unknown');
      });
    }
  }, []);

  const testSTT = async () => {
    setSTTStatus('testing');
    setSTTError('');
    setSTTTranscript('');

    try {
      // First, test microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      // Now test speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech Recognition not supported');
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript;
        setSTTTranscript(text);
        if (result.isFinal) {
          setSTTStatus('success');
        }
      };

      recognition.onerror = (event: any) => {
        setSTTError(`Error: ${event.error} - ${event.message || 'No additional info'}`);
        setSTTStatus('error');
        recognition.stop();
      };

      recognition.onend = () => {
        if (sttStatus === 'testing') {
          setSTTStatus('idle');
        }
      };

      recognition.start();

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (sttStatus === 'testing') {
          recognition.stop();
          if (sttTranscript) {
            setSTTStatus('success');
          } else {
            setSTTStatus('idle');
          }
        }
      }, 5000);

    } catch (err: any) {
      setSTTError(`Error: ${err.name} - ${err.message}`);
      setSTTStatus('error');
    }
  };

  const testTTS = () => {
    setTTSStatus('testing');
    setTTSError('');

    try {
      if (!window.speechSynthesis) {
        throw new Error('Speech Synthesis not supported');
      }

      const utterance = new SpeechSynthesisUtterance('Hello! This is a test of text to speech.');
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        setTTSStatus('testing');
      };

      utterance.onend = () => {
        setTTSStatus('success');
      };

      utterance.onerror = (event: any) => {
        setTTSError(`Error: ${event.error}`);
        setTTSStatus('error');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      setTTSError(`Error: ${err.message}`);
      setTTSStatus('error');
    }
  };

  const StatusIcon = ({ status }: { status: 'idle' | 'testing' | 'success' | 'error' }) => {
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-red-600" />;
    if (status === 'testing') return <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />;
    return null;
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Voice API Browser Diagnostics</h1>

      {/* System Diagnostics */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">System Diagnostics</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {diagnostics.isAndroid ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-yellow-600" />}
            <span className="font-bold">Device: {diagnostics.isAndroid ? 'Android ✓' : diagnostics.isIOS ? 'iOS (NOT Supported)' : 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.isHTTPS ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>Protocol: {diagnostics.protocol} {diagnostics.isHTTPS ? '(Secure ✓)' : '(NOT Secure - Need HTTPS!)'}</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.hasSpeechRecognition ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>Speech Recognition API: {diagnostics.hasSpeechRecognition ? 'Available' : 'Not Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.hasSpeechSynthesis ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>Speech Synthesis API: {diagnostics.hasSpeechSynthesis ? 'Available' : 'Not Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.hasMediaDevices ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>Media Devices API: {diagnostics.hasMediaDevices ? 'Available' : 'Not Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.hasGetUserMedia ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>getUserMedia: {diagnostics.hasGetUserMedia ? 'Available' : 'Not Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            {micPermission === 'granted' ? <CheckCircle className="h-4 w-4 text-green-600" /> : 
             micPermission === 'denied' ? <XCircle className="h-4 w-4 text-red-600" /> :
             <AlertCircle className="h-4 w-4 text-yellow-600" />}
            <span>Microphone Permission: {micPermission}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
          <div><strong>Platform:</strong> {diagnostics.platform}</div>
          <div className="mt-1"><strong>User Agent:</strong> {diagnostics.userAgent}</div>
        </div>
      </div>

      {/* Speech-to-Text Test */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Speech-to-Text Test</h2>
            <StatusIcon status={sttStatus} />
          </div>
          <Button 
            onClick={testSTT} 
            disabled={sttStatus === 'testing' || !diagnostics.hasSpeechRecognition}
            size="sm"
          >
            {sttStatus === 'testing' ? 'Listening...' : 'Test STT'}
          </Button>
        </div>
        
        {sttStatus === 'testing' && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded mb-2 text-sm">
            Speak now! The test will run for 5 seconds...
          </div>
        )}
        
        {sttTranscript && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-2">
            <strong>Transcript:</strong> {sttTranscript}
          </div>
        )}
        
        {sttError && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            <strong>Error:</strong> {sttError}
          </div>
        )}
      </div>

      {/* Text-to-Speech Test */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Text-to-Speech Test</h2>
            <StatusIcon status={ttsStatus} />
          </div>
          <Button 
            onClick={testTTS} 
            disabled={ttsStatus === 'testing' || !diagnostics.hasSpeechSynthesis}
            size="sm"
          >
            {ttsStatus === 'testing' ? 'Playing...' : 'Test TTS'}
          </Button>
        </div>
        
        {ttsStatus === 'testing' && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded mb-2 text-sm">
            Listen for the test message...
          </div>
        )}
        
        {ttsStatus === 'success' && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-2 text-sm">
            TTS completed successfully!
          </div>
        )}
        
        {ttsError && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            <strong>Error:</strong> {ttsError}
          </div>
        )}
      </div>

      {/* Browser-Specific Notes */}
      <div className={`border rounded-lg p-4 ${diagnostics.isAndroid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h3 className="font-semibold mb-2">Important Mobile Browser Notes:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li><strong>iOS Safari/Chrome/Edge:</strong> ❌ Speech Recognition NOT supported (Apple restriction)</li>
          <li><strong>Android Chrome:</strong> ✅ Speech Recognition IS supported (requires HTTPS)</li>
          <li><strong>Android Firefox:</strong> ❌ Speech Recognition NOT supported</li>
          <li><strong>Android Edge:</strong> ✅ Speech Recognition IS supported (requires HTTPS)</li>
          <li><strong>All browsers:</strong> ✅ TTS (Speech Synthesis) is widely supported</li>
          <li><strong>HTTPS Required:</strong> Microphone access MUST be over HTTPS (or localhost)</li>
        </ul>
        {diagnostics.isAndroid && !diagnostics.isHTTPS && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            ⚠️ <strong>You need HTTPS!</strong> Your ngrok URL should start with <code>https://</code>
          </div>
        )}
      </div>
    </div>
  );
}
