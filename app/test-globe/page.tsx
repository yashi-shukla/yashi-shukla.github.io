import GlobeDemo from '@/components/GlobeDemo';

export default function TestGlobePage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto py-8">
                <h1 className="text-4xl font-bold text-white text-center mb-8">
                    GlobeStage Test Page
                </h1>
                <p className="text-gray-300 text-center mb-8">
                    Testing the new 3D GlobeStage component with React Three Fiber
                </p>
                <GlobeDemo />
            </div>
        </div>
    );
}









