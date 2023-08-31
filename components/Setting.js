import { CogIcon } from '@heroicons/react/outline'
import { Popover, Grid } from "@nextui-org/react";

export default function Setting() {
    return (
        <Grid.Container alignContent="right">
            <Grid>
                <Popover>
                    <Popover.Trigger>
                        <CogIcon className='h-6 cursor-pointer' />
                    </Popover.Trigger>
                    <Popover.Content>
                    </Popover.Content>
                </Popover>
            </Grid>
        </Grid.Container>
    );
}
