import { useRef, useState } from 'react';
import { useApp } from '../context';
import { HoverEl } from '../utils';

export default function OnboardingDataChoice() {
  const { state, handleStatementUpload, skipStatementUpload } = useApp();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  function triggerFileSelect() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  async function onUploadSubmit() {
    if (selectedFile) {
      await handleStatementUpload(selectedFile);
    }
  }

  const isLoading = state.authLoading;

  return (
    <div style={{ minHeight:'100vh', background:'#F7F5F2', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px' }}>
      {/* Header */}
      <div style={{ width:'100%', maxWidth:640, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" rx="7" fill="#E8570A" /><path d="M6 20L11 13L16 16.5L22 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span style={{ fontSize:16, fontWeight:700 }}>FinSight</span>
        </div>
        <span style={{ fontSize:13, color:'#9B9B9F', fontWeight:500 }}>Step 2 of 3</span>
      </div>

      <div style={{ width:'100%', maxWidth:640, animation:'fadeUp 0.35s ease' }}>
        <h2 style={{ fontSize:27, fontWeight:700, marginBottom:12, lineHeight:1.3, letterSpacing:'-0.5px', textAlign:'center' }}>
          How would you like to seed your finances?
        </h2>
        <p style={{ fontSize:15, color:'#6E6E73', textAlign:'center', marginBottom:40, lineHeight:1.5 }}>
          Seeding transactions helps FinSight build a highly accurate, personalized financial health score and budget recommendation.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:32 }}>
          {/* Card 1: Upload CSV */}
          <div style={{
            background:'white', border:'1px solid #E8E8E2', borderRadius:16, padding:28,
            display:'flex', flexDirection:'column', justifyContent:'space-between',
            boxShadow:'0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{ width:40, height:40, borderRadius:10, background:'#FFF2EC', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8570A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>Upload Statement</h3>
              <p style={{ fontSize:13, color:'#6E6E73', lineHeight:1.5, marginBottom:20 }}>
                Upload a CSV bank statement. We will parse it securely to seed your dashboard instantly.
              </p>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              
              {!selectedFile ? (
                <HoverEl
                  as="button"
                  onClick={triggerFileSelect}
                  disabled={isLoading}
                  style={{
                    width:'100%', background:'white', color:'#E8570A', border:'1.5px solid #FDDACC',
                    padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6
                  }}
                  hoverStyle={{ background:'#FFF2EC' }}
                >
                  Choose CSV File
                </HoverEl>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{
                    fontSize:12, color:'#1A8A4A', background:'#EDFBF1', border:'1px solid #C3F2D2',
                    borderRadius:8, padding:'8px 10px', display:'flex', alignItems:'center', gap:6,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    {selectedFile.name}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <HoverEl
                      as="button"
                      onClick={onUploadSubmit}
                      disabled={isLoading}
                      style={{
                        flex:2, background:'#E8570A', color:'white', border:'none',
                        padding:'9px 12px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer'
                      }}
                      hoverStyle={{ background:'#C94A06' }}
                    >
                      {isLoading ? 'Uploading...' : 'Import'}
                    </HoverEl>
                    <HoverEl
                      as="button"
                      onClick={() => setSelectedFile(null)}
                      disabled={isLoading}
                      style={{
                        flex:1, background:'white', color:'#6E6E73', border:'1.5px solid #E8E8E2',
                        padding:'9px 12px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer'
                      }}
                      hoverStyle={{ background:'#F5F5F3' }}
                    >
                      Clear
                    </HoverEl>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Skip to Chat */}
          <div style={{
            background:'white', border:'1px solid #E8E8E2', borderRadius:16, padding:28,
            display:'flex', flexDirection:'column', justifyContent:'space-between',
            boxShadow:'0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{ width:40, height:40, borderRadius:10, background:'#EEF0FF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>Conversational AI</h3>
              <p style={{ fontSize:13, color:'#6E6E73', lineHeight:1.5, marginBottom:20 }}>
                Skip uploading. Answer 6-8 brief questions in chat with our AI Copilot to map your budget.
              </p>
            </div>

            <HoverEl
              as="button"
              onClick={skipStatementUpload}
              disabled={isLoading}
              style={{
                width:'100%', background:'white', color:'#1A1A1A', border:'1.5px solid #E8E8E2',
                padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}
              hoverStyle={{ background:'#F5F5F3' }}
            >
              {isLoading ? 'Please wait...' : 'Skip and Start Chat'}
            </HoverEl>
          </div>
        </div>

        {state.authError && (
          <p style={{ fontSize:13, color:'#D63B2F', textAlign:'center', marginTop:12 }}>{state.authError}</p>
        )}
      </div>
    </div>
  );
}
