export class Section
{
	private name$:string;
	private element$:HTMLElement;


	public constructor(name:string, element:HTMLElement)
	{
		this.name$ = name;
		this.element$ = element;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get element() : HTMLElement
	{
		return(this.element$);
	}
}