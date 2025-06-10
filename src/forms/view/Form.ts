import { Section } from "./Section.js";
import { Form as Model } from "../model/Form.js";
import { Form as Parent } from "../../public/Form.js";
import { BusinessEvent } from "../../events/BusinessEvent.js";
import { Form as ViewComponent } from "../../components/Form.js";
import { BusinessEvents } from "../../events/BusinessEvents.js";


export class Form extends ViewComponent
{
	private model$:Model = null;
	private sections:Map<string,Section> = new Map<string,Section>();

	constructor(parent:Parent)
	{
		super(parent)
	}


	public get model() : Model
	{
		return(this.model$);
	}


	public set model(model:Model)
	{
		this.model$ = model;
	}


	/**
	 * This method is called when a business event is propagated to this component.
	 * @param event The business event to handle.
	 * @returns {boolean} Returns true if the event was handled, false otherwise.
	 */
	protected async handleBusinessEvent(event:BusinessEvent) : Promise<void>
	{
		await BusinessEvents.send(event);
	}


	public getSection(source:string) : Section
	{
		let section:Section = this.sections.get(source);

		if (!section)
		{
			section = new Section(source,this.getView());
			this.sections.set(source,section);
		}

		return(section);
	}
}