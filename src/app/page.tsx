import {DragFeedbackProvider} from '../components/Calendar/DragFeedback';
import Calendar from '../components/Calendar/Calendar';

export default function Home() {
  return <DragFeedbackProvider><Calendar /></DragFeedbackProvider>;
}
