import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

import { ProgressBarApp } from '../ProgressBarApp';

export class ProgressCommand implements ISlashCommand {
    public command: string;
    public i18nParamsExample: string;
    public i18nDescription: string;
    public providesPreview: boolean;
    private numberOfSquares: number = 10;

    constructor(private readonly app: ProgressBarApp) {
        this.command = 'progress';
        this.i18nParamsExample = 'progressParamExample';
        this.i18nDescription = '';
        this.providesPreview = false;
    }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp): Promise<void> {
        if (context.getArguments().length > 0) {
            var percentage = Number(context.getArguments()[0]);
            var title = "";

            if (context.getArguments().length > 1) {
                title = " " + context.getArguments().slice(1).join(" ").trim();
            }

            if (Number.isNaN(percentage)) {
                return await this.sendNotifyMessage(context, modify, "Invalid Usage!")
            }

            if (percentage > 100) {
                percentage = 100;
            }

            if (percentage < 0) {
                percentage = 0;
            }

            var numberOfBlackSquares = Number(((this.numberOfSquares * percentage) / 100).toFixed());
            var progressBar = "";

            for (let i = 0; i < this.numberOfSquares; i++) {
                if (i < numberOfBlackSquares) {
                    progressBar += ":black_medium_square: "
                } else {
                    progressBar += ":white_medium_square:"
                }
            }

            var message = "*[" + percentage + "%]*";
            message += title + "\n";
            message += progressBar;

            return await this.sendMessage(context, modify, message);
        }
    }

    private async sendNotifyMessage(context: SlashCommandContext, modify: IModify, text: string): Promise<void> {
        const msg = modify.getCreator().startMessage().setText(text).setRoom(context.getRoom()).setSender(context.getSender()).getMessage();

        return await modify.getNotifier().notifyUser(context.getSender(), msg);
    }

    private async sendMessage(context: SlashCommandContext, modify: IModify, text: string): Promise<void> {
        await modify.getCreator().finish(
            modify.getCreator().startMessage().setText(text).setRoom(context.getRoom()).setSender(context.getSender()));
    }
}
