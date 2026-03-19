import Totti404Sprite from '@/components/Totti404Sprite';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 md:py-24 min-h-[80dvh]">
      <h1 className="font-pixbob-bold text-[80px] md:text-[120px] xl:text-[120px] 2xl:text-[160px] text-text leading-none">
        404
      </h1>
      <p className="font-pixbob-regular text-lg md:text-2xl xl:text-3xl text-text-muted mt-2 md:mt-4 text-center">
        Totti sniffed around but couldn&apos;t find this page.
      </p>
      <div className="relative w-full h-32 md:h-48 xl:h-48 2xl:h-64 mt-8 md:mt-12">
        <Totti404Sprite />
      </div>
      <div className="relative z-10 mt-8 md:mt-12">
        <Button href="/" variant="primary" size="md">Back to Home</Button>
      </div>
    </div>
  );
}
