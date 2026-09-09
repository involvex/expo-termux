package com.involvex.expotermux

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoTermuxModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoTermux")

    Function("executeCommand") { commandPath: String, args: List<String>, workingDir: String?, inBackground: Boolean ->
      dispatchTermuxIntent(commandPath, args, workingDir, inBackground)
    }
  }

  private fun dispatchTermuxIntent(
    commandPath: String,
    args: List<String>,
    workingDir: String?,
    inBackground: Boolean
  ): Boolean {
    return try {
      val context = appContext.reactContext ?: run {
        Log.w(TAG, "React context is null; cannot dispatch Termux intent.")
        return false
      }

      val intent = Intent("com.termux.tasker.ACTION_EXECUTE").apply {
        component = ComponentName("com.termux", "com.termux.app.RunCommandService")
        putExtra("com.termux.execute.path", commandPath)
        putExtra("com.termux.execute.arguments", args.toTypedArray())
        if (workingDir != null) {
          putExtra("com.termux.execute.working_directory", workingDir)
        }
        putExtra("com.termux.execute.background", inBackground)
      }

      if (inBackground && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        ContextCompat.startForegroundService(context, intent)
      } else {
        context.startService(intent)
      }

      true
    } catch (e: Exception) {
      Log.e(TAG, "Failed to dispatch Termux intent.", e)
      false
    }
  }

  companion object {
    private const val TAG = "ExpoTermux"
  }
}
