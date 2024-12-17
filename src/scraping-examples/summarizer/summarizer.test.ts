import { extractSubstring, resumeFile } from "./utils.defs";


describe('Summarizer Tests', () => {
  it('should create a .txt file correctly', async () => {
    await expect(resumeFile("Ma quanto è figo AI!")).toBe(true);
  });
  it('extract substring', () => {
    const s = `
    <a class="link_wide_image boxtrack-economia-1" 
    href="/news/censis-redditi-degli-italiani-giu-del-7-in-20-anni-ultimi-in-europa-per-occupazione-202412061330538733" target="_self">
    <img class="wide-image" src="/remote/static.milanofinanza.it/content_upload/img/2024/12/202412061330538733/Imagoeconomica_113
    1818-904800.jpg?w=520&amp;h=292&amp;mode=crop&amp;format=webp&amp;quality=65&amp;mcache=true" width="520" height="292"></a>`
    expect(
      extractSubstring(s, 'href="', "\" ")
      .replace('href="', "")
      .replace(/"/g, "")
    ).toBe("/news/censis-redditi-degli-italiani-giu-del-7-in-20-anni-ultimi-in-europa-per-occupazione-202412061330538733");
  });
  it('for fortune ita should extract substring properly', async () => {
    const s = `<a href="https://www.fortuneita.com/2024/09/09/la-startup-di-elon-musk-xai-potrebbe-essere-utile-a-tesla-ecco-come/">\n' +
      '\t\t\t\t\t\t\t<img src="https://www.fortuneita.com/wp-content/uploads/elementor/thumbs/shutterstock_2332372463-qtujp15uz2oi1dw8rq0h2oy8u3fgsrb3l6xgp6k2w0.jpg" title="In,This,Photo,Illustration,,The,Xai,Logo,Is,Seen,On" alt="Elon Musk xAI Tesla" loading="lazy">\t\t\t\t\t\t\t\t</a>`
    expect(
      extractSubstring(s, 'href="', '">')
      .replace('href="', "")
      .replace(/"/g, "")
    ).toBe("https://www.fortuneita.com/2024/09/09/la-startup-di-elon-musk-xai-potrebbe-essere-utile-a-tesla-ecco-come/");
  })
});

