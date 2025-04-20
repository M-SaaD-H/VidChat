import Form from "@/components/Form";

export default function Home() {
  return (
    <div className='flex flex-col justify-center items-center gap-8 p-24'>
      <h1 className='text-4xl font-sans font-bold tracking-tight'>Lobby</h1>

      <Form />
    </div>
  );
}
