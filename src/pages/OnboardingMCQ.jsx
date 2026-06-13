import { useApp, MCQ_QUESTIONS } from '../context';
import { HoverEl } from '../utils';

export default function OnboardingMCQ() {
  const { state, selectMCQOption } = useApp();
  const { mcqStep, mcqAnswers } = state;
  const question = MCQ_QUESTIONS[mcqStep];
  const progress = (mcqStep / MCQ_QUESTIONS.length) * 100;

  const isLoading = state.authLoading;

  return (
    <div style={{ minHeight:'100vh', background:'#F7F5F2', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px' }}>
      {/* Header */}
      <div style={{ width:'100%', maxWidth:560, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" rx="7" fill="#E8570A" /><path d="M6 20L11 13L16 16.5L22 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span style={{ fontSize:16, fontWeight:700 }}>FinSight</span>
        </div>
        <span style={{ fontSize:13, color:'#9B9B9F', fontWeight:500 }}>{mcqStep + 1} of {MCQ_QUESTIONS.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ width:'100%', maxWidth:560, height:3, background:'#E8E8E2', borderRadius:2, marginBottom:52, overflow:'hidden' }}>
        <div style={{ height:'100%', width:progress + '%', background:'#E8570A', borderRadius:2, transition:'width 0.4s ease' }} />
      </div>

      {/* Question */}
      <div style={{ width:'100%', maxWidth:560, animation:'fadeUp 0.35s ease', opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
        <h2 style={{ fontSize:27, fontWeight:700, marginBottom:32, lineHeight:1.3, letterSpacing:'-0.5px' }}>{question.q}</h2>
        {question.opts.map((text, i) => {
          const sel = mcqAnswers[mcqStep] === i;
          return (
            <HoverEl
              key={i}
              onClick={() => !isLoading && selectMCQOption(i)}
              style={{
                display:'flex', alignItems:'center', gap:13, padding:'15px 18px',
                border:sel ? '2px solid #E8570A' : '2px solid #E8E8E2',
                borderRadius:12, background:sel ? '#FFF2EC' : 'white',
                cursor: isLoading ? 'wait' : 'pointer', marginBottom:10, transition:'all 0.15s',
              }}
              hoverStyle={{ borderColor:sel ? '#E8570A' : '#C8C8C0', background:sel ? '#FFF2EC' : '#FAFAF8' }}
            >

              <div style={{
                width:20, height:20, borderRadius:'50%',
                border:sel ? '2px solid #E8570A' : '2px solid #D0D0C8',
                background:sel ? '#E8570A' : 'white',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                {sel && (
                  <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                )}
              </div>
              <span style={{ fontSize:15 }}>{text}</span>
            </HoverEl>
          );
        })}
      </div>
    </div>
  );
}
