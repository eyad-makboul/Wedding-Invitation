import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { TextPlugin } from 'gsap/TextPlugin';

export function registerGSAPPlugins() {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, CustomEase, TextPlugin);
  }
}

export { gsap, ScrollTrigger };
