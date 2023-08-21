"use-client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { MAX_FREE_COUNTS } from "@/public/constants";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FreeCounterProps {
    apiLimitCount: number;
};

export const FreeCounter = ({
    apiLimitCount = 0
}: FreeCounterProps) => {
    const [mounted, setMounted] = useState(false)

useEffect(() => {
    setMounted(true)
}, [])

if(!mounted) {
    return null;
}

    return (
        <div className="px-3">
            <Card className="bg-white/10 border-0">
                <CardContent className="py-6">
                    <div className="text-center text-sm text-white mb-4">
                        <p>
                            { apiLimitCount } / { MAX_FREE_COUNTS } Freebies
                        </p>
                        <Progress 
                            className='h-3'
                            value={(apiLimitCount / MAX_FREE_COUNTS) * 100}
                        />
                        <Button className="w-full" variant='premium'>
                            Upgrade
                            <Zap className="w-4 h-4 ml-2 fill-white"/>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}