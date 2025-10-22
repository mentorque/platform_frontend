import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from '@/pages/Dashboard'
import Progress from '@/pages/Progress'
import ResumeReview from '@/pages/ResumeReview'
import ResumeRebuild from '@/pages/ResumeRebuild'
import PortfolioTemplates from '@/pages/PortfolioTemplates'
import AIAssistant from '@/pages/AIAssistant'
import MockInterview from '@/pages/MockInterview'
import CheatSheetPrep from '@/pages/CheatSheetPrep'
import APIKeys from '@/pages/APIKeys'
import AppliedJobs from '@/pages/AppliedJobs'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/resume-review" element={<ResumeReview />} />
          <Route path="/api-keys" element={<APIKeys />} />
          <Route path="/applied-jobs" element={<AppliedJobs />} />
          <Route path="/resume-rebuild" element={<ResumeRebuild />} />
          <Route path="/portfolio-templates" element={<PortfolioTemplates />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/cheat-sheet-prep" element={<CheatSheetPrep />} />
          <Route path="/mock-interviews" element={<MockInterview />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
