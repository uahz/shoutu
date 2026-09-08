# -*- coding: utf-8 -*-
"""守土 · 桌面版启动器（pywebview + Edge WebView2）"""
import os
import sys
import tempfile

import webview


def res_path(rel: str) -> str:
    """兼容 PyInstaller onefile（sys._MEIPASS）与源码运行两种模式"""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel)


def main() -> None:
    html = res_path("index.html")
    if not os.path.exists(html):
        raise FileNotFoundError(f"缺少游戏文件: {html}")

    # 存档（localStorage）持久化到用户数据目录，重装/换目录不丢档
    storage = os.path.join(
        os.environ.get("APPDATA", tempfile.gettempdir()), "ShoutuGame"
    )
    os.makedirs(storage, exist_ok=True)

    webview.create_window(
        title="守土 · 城市治理模拟",
        url=html,
        width=1280,
        height=840,
        min_size=(420, 640),
        background_color="#0a100e",
    )
    # private_mode=False：启用持久存储；storage_path：指定 WebView2 用户数据目录
    webview.start(private_mode=False, storage_path=storage, debug=False)


if __name__ == "__main__":
    main()
