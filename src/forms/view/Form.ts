import { Section } from "./Section.js";
import { Form as Model } from "../model/Form.js";
import { Form as Parent } from "../../public/Form.js";
import { Form as ViewComponent } from "../../components/Form.js";


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