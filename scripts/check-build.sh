#!/bin/bash
echo "Running TypeScript type check..."
npx tsc -b --noEmit 2>&1
TSC_EXIT=$?
echo ""
echo "TSC exit code: $TSC_EXIT"
if [ $TSC_EXIT -ne 0 ]; then
  echo "TypeScript check FAILED"
  exit 1
fi
echo "TypeScript check PASSED"
echo ""
echo "Running Vite build..."
npx vite build 2>&1
VITE_EXIT=$?
echo ""
echo "Vite exit code: $VITE_EXIT"
if [ $VITE_EXIT -ne 0 ]; then
  echo "Vite build FAILED"
  exit 1
fi
echo "Build PASSED"
