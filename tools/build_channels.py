"""Freeze native game components; never edits the source games. Run from super-test/tools."""
from pathlib import Path
import re, hashlib, json
root=Path(__file__).resolve().parents[1]
sources=root.parent
manifest={}
for game in ['scale-quest','tidal-tones','earshot-saloon','brainwaves','rhythm-trainer','rooftop-runner']:
    source=(sources/game/'index.html').read_text()
    manifest[game]={'source':f'{game}/index.html','sha256':hashlib.sha256(source.encode()).hexdigest()}
    # Three native engines use a private IIFE. Unwrap only that main script in the frozen copy,
    # so the adapter can call its original functions without eval or touching the live game.
    if game in ['tidal-tones','rooftop-runner','rhythm-trainer']:
        scripts=list(re.finditer(r'<script>([\s\S]*?)</script>',source))
        main=max(scripts,key=lambda m:len(m[1]))
        code=main[1]
        code=code.replace('(() => {','',1)
        end=code.rfind('})();')
        assert end>=0, game
        code=code[:end]+code[end+5:]
        source=source[:main.start(1)]+code+source[main.end(1):]
    # Cloud configuration is removed from these local component snapshots.
    source=re.sub(r"apiKey:\s*'[^']*'", "apiKey: ''",source)
    # Relative resources remain local to the frozen component folder. Intro playback is suppressed in bootstrap.
    source=source.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\' \'unsafe-inline\'; connect-src \'none\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' data: blob:; media-src \'none\'">\n<script src="../channel-bootstrap.js"></script>',1)
    source=re.sub(r'<body([^>]*)>',lambda m:f'<body{m[1]} data-super-engine="{game}">',source,count=1)
    source=source.replace('</body>','<script src="../channel-bridge.js?v=4"></script></body>')
    (root/'channels'/f'{game}.html').write_text(source)
(root/'channels'/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
