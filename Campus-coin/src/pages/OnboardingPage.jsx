import { useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import { navigate } from '../routes/AppRoutes'
import '../styles/onboarding.css'

function OnboardingPage(){
 const [step,setStep]=useState(1); const [allowance,setAllowance]=useState(''); const [goal,setGoal]=useState('')
 const next=()=> step===1 ? setStep(2) : navigate('/')
 return <div className="onboarding-page">
   <header className="onboarding-header"><button onClick={()=>navigate('/')}><Logo/></button><div><span>Step {step} of 2</span><i><em style={{width:`${step*50}%`}}/></i></div><button className="onboarding-skip" onClick={()=>navigate('/')}>Skip for now</button></header>
   <main className="onboarding-main">
    {step===1 ? <section className="onboarding-card">
      <div className="onboarding-icon"><Icon name="grad" size={24}/></div><span className="onboarding-eyebrow">Let's set up your baseline</span>
      <h1>How do you usually receive money?</h1><p>This helps CampusCoin make your dashboard useful from day one. You can change these details later.</p>
      <div className="choice-grid"><button className="choice"><b>Monthly allowance</b><span>Family or sponsor support</span></button><button className="choice"><b>Scholarship or grant</b><span>Regular education funding</span></button><button className="choice"><b>Work or gigs</b><span>Part-time income</span></button><button className="choice"><b>A mix of these</b><span>Several income sources</span></button></div>
      <Button className="onboarding-next" onClick={next}>Continue <Icon name="arrow" size={18}/></Button>
    </section> : <section className="onboarding-card onboarding-card-wide">
      <div className="onboarding-icon"><Icon name="target" size={24}/></div><span className="onboarding-eyebrow">One last step</span><h1>Set your monthly baseline</h1><p>Give us a rough number. CampusCoin uses it to make your balance and budget views meaningful.</p>
      <div className="onboarding-input-row"><label>Typical monthly income<input value={allowance} onChange={e=>setAllowance(e.target.value)} placeholder="$1,000" /></label><label>Savings goal<input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="$200" /></label></div>
      <div className="onboarding-note"><Icon name="lock" size={17}/><span>You can edit or remove these numbers anytime. They are not connected to your bank.</span></div>
      <Button className="onboarding-next" onClick={next}>Finish setup <Icon name="arrow" size={18}/></Button>
    </section>}
   </main>
 </div>
}
export default OnboardingPage
