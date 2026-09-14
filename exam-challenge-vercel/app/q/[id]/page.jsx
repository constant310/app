import ChallengeClient from '../../challenge-client';

export default async function QuestionPage({ params }) {
  const { id } = await params;
  return <ChallengeClient questionId={id} />;
}
