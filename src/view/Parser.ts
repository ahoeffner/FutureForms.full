/*
  MIT License

  Copyright © 2023 Alex Høffner

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
import { TagLibrary } from './tags/TagLibrary.js';


export class Parser
{
   /**
    *
    * @param fr An element
    * @param to Another element
    * @returns The other element, but with all the original attributes
    */
	public static copyAllAttributes(fr:Element,to:Element) : void
	{
		if (fr == null || to == null) return;
		let attrnames:string[] = fr.getAttributeNames();

		for (let an = 0; an < attrnames.length; an++)
			to.setAttribute(attrnames[an],fr.getAttribute(attrnames[an]));
	}


   /**
    * Parse and replace custom tags for the element
    * @param component The component that 'ownes' this piece of html
    * @param element The html element
    */
   public async parseContent(element?:HTMLElement, component?:any) : Promise<void>
   {
      if (element == null)
			element = document.body;

		if (!element.childNodes)
			return;

      let nodes:Node[] = [];
		element.childNodes.forEach((node) => {nodes.push(node)});

      for (let i = 0; i < nodes.length; i++)
      {
         if (nodes[i] instanceof HTMLElement)
         {
            if (!await this.parseElement(component,nodes[i]))
               await this.parseContent(nodes[i] as HTMLElement, component);
         }
      }
   }


   /**
    * Parse and possible replace the given element
    * @param component The component that 'ownes' this piece of html
    * @param element The html element
    * @param skip Custom tags/attributes that should be skipped (when recursive)
    * @returns Whether the tag was modified
    */
   private async parseElement(component:any, element:Node, skip?:string[]) : Promise<boolean>
   {
      let tag:Tag = null;
      let replace:HTMLElement|HTMLElement[] = null;

      if (!skip)
         skip = [];

      if (!(element instanceof HTMLElement))
         return(false);

      tag = TagLibrary.getCustomTag(element.tagName);
      if (tag && skip && skip.indexOf(tag.identifier?.toLowerCase()) >= 0) tag = null;

      if (tag)
      {
         replace = await this.getTagReplacement(tag,component,element,null,skip);
         await this.replace(component,element,replace);
         return(true);
      }

      let attrs:string[] = element.getAttributeNames();

      for (let i = 0; i < attrs.length; i++)
      {
         let attr:string = attrs[i];
         tag = TagLibrary.getCustomAttribute(attr);
         if (tag && skip && skip.indexOf(tag.identifier?.toLowerCase()) >= 0) tag = null;

         if (tag != null)
         {
            replace = await this.getTagReplacement(tag,component,element,attr,skip);
            await this.replace(component,element,replace);
            return(true);
         }
      }

      return(false);
   }


   private async replace(component:any, element:HTMLElement, replace:HTMLElement|HTMLElement[]) : Promise<void>
   {
      if (!replace)
         return;

      if (!Array.isArray(replace))
      {
         element.replaceWith(replace);
         await this.parseContent(replace,component);
         return;
      }

      let next:HTMLElement = element;
      let prev:HTMLElement = element;

      for (let i = 0; i < replace.length; i++)
      {
         next.after(replace[i]);
         await this.parseContent(replace[i],component);
         next = replace[i];
      }

      prev.remove();
   }


   private async getTagReplacement(tag:Tag, component:any, element:Node, attr:string, skip:string[]) : Promise<HTMLElement|HTMLElement[]>
   {
      let resp:any = tag.replace(component,element as HTMLElement,attr);
      if (resp instanceof Promise) await resp;

      if (resp)
      {
         skip.push(tag.identifier?.toLowerCase());

         if (!Array.isArray(resp))
         {
            await this.parseElement(component,resp,skip);
         }
         else
         {
            for (let i = 0; i < resp.length; i++)
            {
               await this.parseElement(component,resp[i],skip);
            }
         }
      }

      return(resp)
   }
}