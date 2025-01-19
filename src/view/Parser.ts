/*
  MIT License

  Copyright © 2024 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Tag } from './tags/Tag.js';
import { Class } from '../public/Class.js';
import { TagLibrary } from './tags/TagLibrary.js';
import { ComponentTag } from './tags/ComponentTag.js';


export class Parser
{
	private events$:ClassEvent[] = [];
   private tags$:Map<Class<Tag>,Tag[]> = new Map<Class<Tag>,Tag[]>();
   private comps$:Map<Class<Tag>,any[]> = new Map<Class<Tag>,any[]>();

   /**
    * Parse and replace custom tags for the element
    * @param element The html element
    */
   public async parse(element?:HTMLElement) : Promise<Parser>
   {
      if (element == null)
			element = document.body;

      await this.parseContent(element);
		return(this);
   }


	public getEvents() : ClassEvent[]
	{
		return(this.events$);
	}


   public getUsedTags() : Class<Tag>[]
   {
      let tags:Class<Tag>[] = [];
      this.tags$.forEach((_tags, clazz) => tags.push(clazz));
      return(tags);
   }


   public getUsedComponentTags() : Class<Tag>[]
   {
      let tags:Class<Tag>[] = [];
      this.comps$.forEach((_tags, clazz) => tags.push(clazz));
      return(tags);
   }


   public getTags(clazz:Class<Tag>) : Tag[]
   {
      return(this.tags$.get(clazz));
   }


   public getComponents(clazz?:Class<Tag>) : any[]
   {
		if (clazz)
      	return(this.comps$.get(clazz));

		let all:any[] = [];
		this.comps$.forEach((comps) => all.push(...comps));

		return(all);
   }


   public getComponentsByName(clazz:string) : any[]
   {
		let all:any[] = [];

		this.comps$.forEach((comps) =>
		{
			comps.forEach((comp) =>
			{
				if (comp.constructor.name == clazz)
					all.push(comp);
			})
		});

		return(all);
   }


   private async parseContent(element?:HTMLElement) : Promise<void>
   {
		if (!element)
			return;

		this.parseEvents(element);

		if (!element.childNodes)
			return;

      let nodes:Node[] = [];
		element.childNodes.forEach((node) => {nodes.push(node)});

      for (let i = 0; i < nodes.length; i++)
      {
         if (nodes[i] instanceof HTMLElement)
         {
            if (!await this.parseElement(nodes[i]))
               await this.parseContent(nodes[i] as HTMLElement);
         }
      }
   }


   /**
    * Parse and possible replace the given element
    * @param element The html element
    * @param skip Custom tags/attributes that should be skipped (when recursive)
    * @returns Whether the tag was modified
    */
   private async parseElement(element:Node, skip?:string[]) : Promise<boolean>
   {
      let tag:Tag = null;
      let clazz:Class<Tag> = null;

      let replace:HTMLElement|HTMLElement[] = null;

      if (!skip)
         skip = [];

      if (!(element instanceof HTMLElement))
         return(false);

      clazz = TagLibrary.getCustomTag(element.tagName); if (clazz) tag = new clazz();
      if (tag && skip && skip.indexOf(tag.identifier?.toLowerCase()) >= 0) tag = null;

      if (tag != null)
      {
         if (tag instanceof ComponentTag)
				return(await this.consume(clazz,tag,element,null));

         replace = await this.getTagReplacement(clazz,tag,element,null,skip);
         await this.replace(element,replace);
         return(true);
      }

      let attrs:string[] = element.getAttributeNames();

      for (let i = 0; i < attrs.length; i++)
      {
         let attr:string = attrs[i];

         clazz = TagLibrary.getCustomAttribute(attr); if (clazz) tag = new clazz();
         if (tag && skip && skip.indexOf(tag.identifier?.toLowerCase()) >= 0) tag = null;

         if (tag != null)
         {
				if (tag instanceof ComponentTag)
					return(await this.consume(clazz,tag,element,attr));

            replace = await this.getTagReplacement(clazz,tag,element,attr,skip);
            await this.replace(element,replace);
            return(true);
         }
      }

      return(false);
   }


   private async replace(element:HTMLElement, replace:HTMLElement|HTMLElement[]) : Promise<void>
   {
      if (!replace)
         return;

      if (!Array.isArray(replace))
      {
         element.replaceWith(replace);
         await this.parseContent(replace);
         return;
      }

      let next:HTMLElement = element;
      let prev:HTMLElement = element;

      for (let i = 0; i < replace.length; i++)
      {
         next.after(replace[i]);
         await this.parseContent(replace[i]);
         next = replace[i];
      }

      prev.remove();
   }


   private async getTagReplacement(clazz:Class<Tag>, tag:Tag, element:Node, attr:string, skip:string[]) : Promise<HTMLElement|HTMLElement[]>
   {
      let tags:Tag[] = this.tags$.get(clazz);
      if (!tags) { tags = []; this.tags$.set(clazz,tags)}

      tags.push(tag);

      let resp:any = tag.replace(element as HTMLElement,attr);
      if (resp instanceof Promise) await resp;

      if (resp)
      {
         // Recursive replacements
         skip.push(tag.identifier?.toLowerCase());

         if (!Array.isArray(resp))
         {
            await this.parseElement(resp,skip);
         }
         else
         {
            for (let i = 0; i < resp.length; i++)
               await this.parseElement(resp[i],skip);
         }
      }

      return(resp)
   }


   private async consume(clazz:Class<Tag>, tag:ComponentTag, element:Node, attr:string) : Promise<boolean>
   {
      let comp:any = tag.consume(element as HTMLElement,attr);
      if (comp instanceof Promise) comp = await comp;
		if (!comp) return(false);

      let comps:any[] = this.comps$.get(clazz);
      if (!comps) { comps = []; this.comps$.set(clazz,comps)}
      comps.push(comp);

      return(true);
   }


	private parseEvents(element:Node) : void
	{
		if (!(element instanceof HTMLElement))
			return;

		if (element.getAttributeNames)
		{
			let attrs:string[] = element.getAttributeNames();

			for (let an = 0; an < attrs.length; an++)
			{
				let func:string = element.getAttribute(attrs[an]);
				if (func != null) func = func.trim();

				if (attrs[an].toLowerCase().startsWith("on") && func.startsWith("this."))
					this.events$.push(new ClassEvent(element,attrs[an],func));
			}
		}
	}
}


export class ClassEvent
{
	constructor(public element:HTMLElement, public event:string, public action:string) {}
}