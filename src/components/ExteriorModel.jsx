import ExteriorBlockout from './ExteriorBlockout.jsx'
import ExteriorGLB from './ExteriorGLB.jsx'
import { PROJECT } from '../config/project.js'

export default function ExteriorModel() {
  if (PROJECT.runtime.useApprovedExteriorModel) {
    return <ExteriorGLB />
  }

  return <ExteriorBlockout />
}
